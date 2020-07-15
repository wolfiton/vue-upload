<template>
    <div>
        <div class="container">
            <b-form @submit="onSubmit" @reset="onReset" v-if="show">
                <b-form-group
                    id="input-group-1"
                    label="Title"
                    label-for="title-input"
                >
                    <b-form-input
                        id="title-input"
                        v-model="form.title"
                        type="text"
                        required
                        placeholder="Enter Post Title"
                    ></b-form-input>
                </b-form-group>

                <b-form-group
                    id="input-group-2"
                    label="Content:"
                    label-for="content-input"
                >
                    <b-form-input
                        id="content-input"
                        v-model="form.content"
                        required
                        placeholder="Enter Post Content"
                    ></b-form-input>
                </b-form-group>

                <b-form-group
                    id="file-input"
                    label="Add Image:"
                    label-for="file-input"
                >
                    <!-- Styled -->
                    <b-form-file
                        id="file-input"
                        v-model="form.file"
                        :state="Boolean(form.file)"
                        placeholder="Choose a file or drop it here..."
                        drop-placeholder="Drop file here..."
                    ></b-form-file>
                    <div class="mt-3">
                        Selected file: {{ form.file ? form.file.name : "" }}
                    </div>
                </b-form-group>
                <b-button class="ml-3" type="submit" variant="primary"
                    >Submit</b-button
                >
                <b-button class="ml-3" type="reset" variant="danger"
                    >Reset</b-button
                >
            </b-form>
            <b-card class="mt-3" header="Form Data Result">
                <pre class="m-0">{{ form }}</pre>
                <pre class="m-0">{{ form.file }}</pre>
            </b-card>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            form: {
                title: "",
                content: "",
                file: null
            },

            show: true
        };
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault();
            alert(JSON.stringify(this.form));
            console.log(this.form.file);
        },
        onReset(evt) {
            evt.preventDefault();
            // Reset our form values
            this.form.title = "";
            this.form.content = "";
            this.form.file = null;
            // Trick to reset/clear native browser form validation state
            this.show = false;
            this.$nextTick(() => {
                this.show = true;
            });
        }
    }
};
</script>
