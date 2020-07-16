<?php

namespace App\GraphQL\Mutations;

use App\Post;

class CreatePostManually
{
    /**
     * @param null $_
     * @param array<string, mixed> $args
     *
     * @return string
     */
    public function __invoke($_, array $args)
    {
        $imagePath->storePublicly('uploads', ['disk' => 'public']);

        return Post::create([
            'title' => $args['title'],
            'content' => $args['content'],
            'image' => $imagePath
        ]);
    }
}
