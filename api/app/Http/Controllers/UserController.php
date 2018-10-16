<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Repositories\UserRepository;

class UserController extends Controller {

    protected $repo;

    public function __construct(UserRepository $repo) {
        $this->repo = $repo;
    }

    public function getAllByQuery(Request $request) {
        $q = $request->input('q');
        $users = $this->repo->search($q);
        return response()->json([
            'users' => $users,
        ], 200);
    }
}
