<?php

namespace App\Http\Middleware;

use Closure;
use App\Exceptions\MutexException;
use App\Repositories\MutexRepository;

class Mutex
{
    protected $repo;

    public function __construct(MutexRepository $repo) {
        $this->repo = $repo;
    }

    public function handle($request, Closure $next, $guard=null) {
        $mutexId = $request->input('mutexId');
        $routeParams = $request->route()[2];
        $courseId = array_key_exists('courseId', $routeParams) ? $routeParams['courseId'] : null;
        $collectId = array_key_exists('collectId', $routeParams) ? $routeParams['collectId'] : null;
        try {
            if(empty($collectId)) {
                $this->repo->updateCourseLastActive($mutexId, $courseId);
            } else {
                $this->repo->updateCollectionActive($mutexId, $collectId);
            }
        } catch(MutexException $e) {
            return response()->json([
                'code' => $e->getCode(),
                'message' => $e->getMessage(),
            ], 423);
        }
        return $next($request);
    }
}
