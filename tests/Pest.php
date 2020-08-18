<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class)->in('Feature');

uses(RefreshDatabase::class)->in('Unit');

uses(RefreshDatabase::class)->in('Feature');
