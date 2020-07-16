<?php

namespace App\GraphQL\Mutations;

class SimpleImageUpload
{
    /**
     * @param null $_
     * @param array<string, mixed> $args
     *
     * @return string
     */
    public function __invoke($_, array $args)
    {
        return $args['image']->storePublicly('uploads');
    }
}
