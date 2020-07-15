<?php

namespace App\GraphQL\Mutations;

class Image
{
    /**
     * @param  null  $_
     * @param  array<string, mixed>  $args
     */
    public function __invoke($_, array $args)
    {
        $uploadedImage = Arr::get($args, 'image');

        return $uploadedImage->storePublicly('uploads');
    }
}
