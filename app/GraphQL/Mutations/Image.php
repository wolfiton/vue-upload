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
        return $args['image']->storePublicly('uploads');

    }
}
