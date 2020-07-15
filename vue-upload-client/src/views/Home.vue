<template>
    <div class="container">
        <ApolloQuery :query="postsQuery">
            <!-- The result will automatically updated -->
            <template slot-scope="{ result: { data, loading } }">
                <!-- Some content -->
                <div v-if="loading">Loading...</div>
                <div v-else>
                    <div class="row">
                        <div class="col-4">
                            <b-card
                                v-for="post of data.posts.data"
                                :key="post.id"
                                :title="post.title"
                                class="mb-2"
                                style="max-width: 20rem;"
                            >
                                <b-card-text>
                                    <img
                                        :src="
                                            `http://localhost:8000/uploads/${post.image}`
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
            postsQuery
        };
    }
};
</script>
