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
        $imagePath = $args['image']->storePublicly('uploads');

        return Post::create([
            'title' => $args['title'],
            'content' => $args['content'],
            'image' => $imagePath
        ]);
    }
}
