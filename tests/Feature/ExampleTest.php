<?php

it('has welcome page')
    ->get('/')
    ->assertStatus(200);
