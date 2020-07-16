<template>
    <div class="container">
        <div class="row">
            <ApolloQuery :query="postsQuery">
                <!-- The result will automatically updated -->
                <template slot-scope="{ result: { data, loading } }">
                    <!-- Some content -->
                    <div v-if="loading">Loading...</div>
                    <div v-else class="row">
                        <b-card
                            v-for="post of data.posts.data"
                            :key="post.id"
                            :title="post.title"
                            class="mb-2 ml-3"
                        >
                            <b-card-text>
                                <img
                                    :src="
                                        `http://localhost:8000/public/storage/${post.image}`
                                    "
                                    alt="cover image"
                                    style="width:200px"
                                />
                                <div>{{ post.content }}</div>
                            </b-card-text>

                            <b-button href="#" variant="primary"
                                >Go somewhere</b-button
                            >
                        </b-card>
                    </div>
                </template>
            </ApolloQuery>
        </div>
    </div>
</template>

<script>
// @ is an alias to /src
import postsQuery from "@/graphql/queries/GetPosts.gql";

export default {
    name: "Home",
    data() {
        return {
            postsQuery
        };
    }
};
</script>
