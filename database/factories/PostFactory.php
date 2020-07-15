<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Post;
use Faker\Generator as Faker;

$factory->define(Post::class, function (Faker $faker) {
    return [
        "title" => $faker->text,
        "content"=> $faker->text,
        "image" => $faker->image('public/uploads',400,300, null, false) 
    ];
});
