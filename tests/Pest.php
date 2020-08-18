<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class)->in('Feature/Models');

uses(RefreshDatabase::class)->in('Unit');

uses(RefreshDatabase::class)->in('Feature/Models');
