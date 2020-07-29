<template>
  <div class="container">
    <b-form @submit.prevent="onSubmit" @reset="onReset">
      <b-form-group id="input-group-1" label="Title" label-for="title-input">
        <b-form-input
          id="title-input"
          v-model="form.title"
          type="text"
          required
          placeholder="Enter Post Title"
        ></b-form-input>
      </b-form-group>

      <b-form-group id="input-group-2" label="Content:" label-for="content-input">
        <b-form-input
          id="content-input"
          v-model="form.content"
          required
          placeholder="Enter Post Content"
        ></b-form-input>
      </b-form-group>

      <b-form-group id="file-input" label="Add Image:" label-for="file-input">
        <!-- Styled -->
        <b-form-file
          id="file-input"
          v-model="form.file"
          :state="Boolean(form.file)"
          placeholder="Choose a file or drop it here..."
          drop-placeholder="Drop file here..."
        ></b-form-file>
        <div class="mt-3">Selected file: {{ form.file ? form.file.name : '' }}</div>
      </b-form-group>

      <b-progress
        v-if="isUploading"
        :value="uploadingProgress"
        :max="100"
        show-progress
        animated
        class="mb-4"
      ></b-progress>

      <b-button class="ml-3" type="submit" variant="primary">Submit</b-button>
      <b-button class="ml-3" type="reset" variant="danger">Reset</b-button>
    </b-form>
    <b-card class="mt-3" header="Form Data Result">
      <pre class="m-0">{{ form }}</pre>
      <pre class="m-0">{{ form.file }}</pre>
    </b-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { CreatePostMutation, CreatePostMutationVariables, GetPostsQuery, Maybe } from '~/graphql/GQLTypes'
import CreatePost from '@/graphql/resources/post/CreatePost.gql'

@Component({
  head() {
    return {
      title: 'Add Post',
    }
  },
})
export default class Home extends Vue {
  form: {
    title: string
    content: string
    file: Maybe<File>
  } = {
    title: '',
    content: '',
    file: null,
  }

  isUploading = false
  uploadingProgress = 0

  onSubmit() {
    // todo: here should be a client-side validation that title and content are filled
    this.isUploading = true
    const variables: CreatePostMutationVariables = {
      input: {
        title: this.form.title,
        content: this.form.content,
        image: this.form.file,
      },
    }
    this.$apollo
      .mutate<CreatePostMutation>({
        mutation: CreatePost,
        variables,
        context: {
          fetchOptions: {
            onUploadProgress: (progressEvent) => {
              this.uploadingProgress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
            },
          },
        },
      })
      .then((data) => {
        console.log(data)
        this.$router.push('/')
      })
      .catch((e) => {
        console.error(e)
        this.isUploading = false
      })
  }

  onReset() {
    // Reset our form values
    this.form.title = ''
    this.form.content = ''
    this.form.file = null
  }
}
</script>

<style scoped lang="scss"></style>
