<?php

namespace App\Http\Controllers;

use App\GraphQL\GraphQLHandler;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GraphQLController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $query = $request->input('query') ?? $request->getContent();
        $variables = $request->input('variables', []);

        $handler = new GraphQLHandler();
        $result = $handler->handle($query, $variables);

        return response()->json($result);
    }
}