<template>
    <div class="container">
        <ApolloQuery :query="postsQuery">
            <!-- The result will automatically updated -->
            <template slot-scope="{ result: { data, loading } }">
                <!-- Some content -->
                <div v-if="loading">Loading...</div>
                <div v-else class="row">
                    <div
                        v-for="post of data.posts.data"
                        :key="post.id"
                        class="col-12 col-md-6 col-lg-4 mt-2"
                    >
                        <b-card
                            border-variant="primary"
                            header-bg-variant="primary"
                            header-text-variant="white"
                            :header="post.title"
                            style="height:400px;"
                        >
                            <b-card-text>
                                <img
                                    :src="
                                        `http://localhost:8000/storage/${post.image}`
                                    "
                                    alt="cover image"
                                    style="max-width:200px; max-height:300px;"
                                    class="rounded"
                                />
                                <div>{{ post.content }}</div>
                            </b-card-text>

                            <b-button href="#" variant="primary"
                                >Go somewhere</b-button
                            >
                        </b-card>
                    </div>
                </div>
            </template>
        </ApolloQuery>
    </div>
</template>

<script>
// @ is an alias to /src
import postsQuery from "@/graphql/queries/GetPosts.gql";

export default {
    name: "Home",
    data() {
        return {
            postsQuery,
            posts: []
        };
    }
};
</script>
