import Vue from 'vue'
import axios from 'axios'
import { ApolloClient } from 'apollo-client'
import * as ApolloUploadClient from 'apollo-upload-client'
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'
import VueApollo, { ApolloProvider } from 'vue-apollo'
import { ApolloLink, from, Observable } from 'apollo-link'
import { onError } from 'apollo-link-error'
import gql from 'graphql-tag'
import { HttpOptions } from 'apollo-link-http-common'
import { Plugin } from '@nuxt/types'
import { Response, Headers } from 'cross-fetch'
import { identity, mapKeys } from 'lodash'
import FormData from 'form-data'
import introspectionQueryResultData from '~/graphql/fragmentTypes.json'

// Install the vue plugin
Vue.use(VueApollo)

interface QueueStatus {
  isRefreshing: boolean
  queue: any[]
}

const tokenRefreshQueue: QueueStatus = {
  isRefreshing: false,
  queue: [],
}

/**
 * A Fetch WebAPI implementation based on the Axios client
 */
async function axiosFetch(axiosObj, transfomer, input, init: any = {}) {
  // Convert the `fetch` style arguments into a Axios style config
  transfomer = transfomer || identity

  const lowerCasedHeaders = mapKeys(init.headers, (_, key) => {
    return key.toLowerCase()
  })

  if (!('content-type' in lowerCasedHeaders)) {
    lowerCasedHeaders['content-type'] = 'text/plain;charset=UTF-8'
  }

  const config = transfomer(
    {
      url: input,
      method: init.method || 'GET',
      data: init.body instanceof FormData ? init.body : String(init.body),
      headers: lowerCasedHeaders,
      validateStatus: () => true,
    },
    input,
    init
  )

  const result = await axiosObj.request(config)

  // Convert the Axios style response into a `fetch` style response
  const responseBody = typeof result.data === `object` ? JSON.stringify(result.data) : result.data

  const headers = new Headers()
  Object.entries(result.headers).forEach(([key, value]: any) => {
    headers.append(key, value)
  })

  return new Response(responseBody, {
    status: result.status,
    statusText: result.statusText,
    headers,
  })
}

function buildAxiosFetch(axiosObj, transformer) {
  return axiosFetch.bind(undefined, axiosObj, transformer)
}

const plugin: Plugin = ({ app, redirect, beforeNuxtRender, isDev, $config }) => {
  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData,
  })

  const apolloClientCache = new InMemoryCache({ fragmentMatcher })

  if (!process.server) {
    apolloClientCache.restore((window as any).__NUXT__ ? (window as any).__NUXT__.apollo.defaultClient : null)
  }

  const apolloClientOptions: HttpOptions = {
    // in dev environment add XDEBUG_SESSION_START=phpstorm attribute to url, so it is possible to debug graphql-requests
    uri: $config.graphqlEndpoint + (isDev ? '?XDEBUG_SESSION_START=phpstorm' : ''),
    fetch: buildAxiosFetch(axios, (config, _, init) => {
      return {
        ...config,
        onUploadProgress: init.onUploadProgress,
      }
    }),
  }
  const uploadLink = ApolloUploadClient.createUploadLink(apolloClientOptions)

  const customMiddleware = new ApolloLink((operation, forward: any) => {
    // add the authorization to the headers
    // TODO @wolfiton: pick token from the storage. Be aware - this also gets called on the server while SSR,
    //                 so you storage should be available on SSR side too! So localStorage is not an option.
    const token = '...'
    operation.setContext({
      headers: {
        Authorization: token ? `Bearer ${token}` : null,
      },
    })

    return forward(operation).map((response) => {
      // decrease loading counter
      return response
    })
    // alternative definition of functionality above with more granular control. Currently not needed
    // return new Observable(observer => {
    //   return forward(operation).subscribe({
    //     next: response => {
    //       console.log(`[Apollo Query END] ${operation.operationName}`);
    //       observer.next(response);
    //     },
    //     error: err => {
    //       console.log(`[Apollo Query END ERROR] ${operation.operationName}`);
    //       observer.error(err);
    //     },
    //     complete: observer.complete.bind(observer)
    //   });
    // });
  })

  const errorHandler = onError(({ graphQLErrors, operation, forward, response }) => {
    // TODO @wolfiton: following code gives the ability to try to auth-refresh token automatically
    if (graphQLErrors) {
      // fetch token refresh queue, determine, if we have to refresh token
      const { message } = graphQLErrors[0]
      // message depends on the server implementation!
      if (message === 'UNAUTHORIZED') {
        // fetch used token
        let usedToken
        const headers = operation.getContext().headers
        if (headers) {
          const authHeader = headers.Authorization
          if (authHeader) {
            usedToken = authHeader.substr('Bearer '.length)
          }
        }

        if (usedToken) {
          // token was used, but it is actually expired, so refresh it
          // console.log(`[JWT Auth] Request ${operation.operationName} failed with followed token ${usedToken}`)
          const observableCallback = (observer) => {
            // prepare retry request
            const subscriber = {
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            }

            const retryRequest = () => {
              // TODO @wolfiton: Here you have to pick new token from your storage. Again, it may run on SSR!
              const newToken = '...'
              // console.log(`[JWT Auth] retrying request ${operation.operationName} with token ${newToken}`);
              operation.setContext({
                headers: {
                  ...headers,
                  Authorization: `Bearer ${newToken}`,
                },
              })

              return forward(operation).subscribe(subscriber)
            }

            // if there is no refreshing request queued, run refreshing query
            if (!tokenRefreshQueue.isRefreshing) {
              tokenRefreshQueue.isRefreshing = true

              // console.log('[JWT Auth] Refresh token...');
              // TODO @wolfiton: Define the mutation for token refresh!
              return apolloClient
                .mutate({
                  fetchPolicy: 'no-cache',
                  mutation: gql`
                    # mutation refreshToken {
                    #   ...
                    # }
                  `,
                })
                .then(({ _ }: any) => {
                  // TODO @wolfiton: store new token to the storage
                  // someStorage.set('token', data.refresh.token, 365)
                  tokenRefreshQueue.isRefreshing = false
                  // console.log('[JWT Auth] Token was refreshed, new token is', data.refresh.token);

                  // retry also all queued queries.
                  tokenRefreshQueue.queue.forEach((queuedCallback) => {
                    queuedCallback(null)
                  })
                  tokenRefreshQueue.queue = []

                  return retryRequest()
                })
                .catch((e) => {
                  // console.error(e);
                  // console.warn('[JWT Auth] JWT could not be refreshed. Navigation to login page...')
                  tokenRefreshQueue.isRefreshing = false

                  // break up also all queued queries.
                  tokenRefreshQueue.queue.forEach((queuedCallback) => {
                    queuedCallback(new Error('Unable to refresh access token'))
                  })
                  tokenRefreshQueue.queue = []

                  if (process.server) {
                    // IMPORTANT! Without observer.next() server gets stucked and waits for this promise for ever!
                    observer.next(response)
                  } else {
                    observer.error(e)
                  }

                  // TODO @wolfiton: logout user. in action you may also redirect user to login page
                  // await store.dispatch('account/logout')
                })
            } else {
              // subscribe to retrying after token gets refreshed
              return new Promise((resolve) => {
                tokenRefreshQueue.queue.push((errRefreshing) => {
                  // console.log('[refresh] QUEUED callback was called with params:', errRefreshing)
                  if (!errRefreshing) {
                    return resolve(retryRequest())
                  } else {
                    observer.error(errRefreshing)
                  }
                })
              })
            }
          }

          return new Observable(observableCallback as any)
        } else {
          redirect('/login')
          // console.log('[JWT Auth] No token was provided, but expected. Navigation to login page...')
        }
      }
    }
  })

  // Create the apollo client
  const apolloClient = new ApolloClient({
    link: from([customMiddleware, errorHandler, uploadLink]),
    cache: apolloClientCache,
    connectToDevTools: process.client,
    ...(process.server
      ? {
          ssrMode: true,
        }
      : {
          ssrForceFetchDelay: 100,
        }),
  })

  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
  })
  ;(app as any).apolloProvider = apolloProvider

  if (process.server) {
    const apolloSSR = require('vue-apollo/ssr')
    beforeNuxtRender(({ nuxtState }) => {
      nuxtState.apollo = apolloSSR.getStates(apolloProvider)
    })
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    apolloProvider: ApolloProvider
  }
}

export default plugin
