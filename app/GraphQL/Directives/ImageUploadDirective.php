<?php

namespace App\GraphQL\Directives;

use GraphQL\Error\Error;
use Nuwave\Lighthouse\Schema\Directives\BaseDirective;
use Nuwave\Lighthouse\Support\Contracts\ArgResolver;
use Nuwave\Lighthouse\Support\Contracts\DefinedDirective;

class ImageUploadDirective extends BaseDirective implements ArgResolver, DefinedDirective
{

    public static function definition(): string
    {
        return /** @lang GraphQL */ <<<'SDL'
"""
Upload image and store the path to the root model
"""
directive @imageUpload on INPUT_FIELD_DEFINITION | ARGUMENT_DEFINITION
SDL;
    }

    /**
     * @param \Illuminate\Database\Eloquent\Model $rootModel
     * @param \Illuminate\Http\UploadedFile $image
     *
     * @return mixed|void
     * @throws Error
     */
    public function __invoke($rootModel, $image)
    {
        $attributeName = $this->definitionNode->name->value;

        $rootModel->$attributeName = $image->storePublicly('uploads');
        $rootModel->save();
    }
}
