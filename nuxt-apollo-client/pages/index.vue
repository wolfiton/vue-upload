<template>
  <div class="container">
    <div class="row" v-if="posts">
      <div v-for="post of posts.data" :key="post.id" class="col-12 col-md-6 col-lg-4 mt-2">
        <b-card
          border-variant="primary"
          header-bg-variant="primary"
          header-text-variant="white"
          :header="post.title"
          style="height: 400px;"
        >
          <b-card-text class="d-flex flex-column align-items-center">
            <img
              :src="`${$config.storageBaseUrl}/${post.image}`"
              alt="cover image"
              style="max-width: 200px; max-height: 300px;"
              class="rounded"
            />
            <span>{{ post.content }}</span>
          </b-card-text>

          <b-button href="#" variant="primary">Go somewhere</b-button>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { GetPostsQuery } from '~/graphql/GQLTypes'
import GetPosts from '@/graphql/resources/post/GetPosts.gql'

@Component({
  async asyncData({ app }) {
    const data: any = {}
    const res = await app.apolloProvider!.defaultClient.query<GetPostsQuery>({
      query: GetPosts,
    })
    data.posts = res.data.posts
    return data
  },
  head() {
    return {
      title: 'Home',
    }
  },
})
export default class Home extends Vue {
  posts!: GetPostsQuery['posts']
}
</script>

<style scoped lang="scss"></style>
