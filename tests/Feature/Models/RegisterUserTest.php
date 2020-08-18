<?php


namespace Tests\Feature\Models;

use Nuwave\Lighthouse\Testing\MakesGraphQLRequests;

use App\User;

/**
 *  Return a User data after the gql mutation and compare to with the given data
 *
 *  @param  int $id
 *  @param string $name  
 *  @param string $username
 *  @param string $email
 *  @param string $password
 *  @return @void
 */

test('test_user_register', function () {

    $id =  User::max('id') + 1;;

    $name = "Laravel Gql";

    $username = "laravel_gql";

    $email = "laravel@example.com";

    $password = "password"; //default for factories

    $this
        ->graphQL(
            /** @lang GraphQL */
            '
            mutation ($name: String!, $username: String!, $email: String!, $password: String!) {
                createUser(input: {
                    name: $name
                    username: $username
                    email: $email
                    password: $password
                }) {
                    id
                    username
                    email
                    password
                }
            }
            ',
            [
                'email' => $email,
                'password' => $password,
            ]
        )->assertExactJson([
            'data' => [
                'createUser' => [
                    'id' => "$id",
                    'username' => $username,
                    'email' => $email,
                    'password' => $password,
                ]
            ]
        ]);
});
