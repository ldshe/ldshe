<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;

use App\Exceptions\MutexException;
use App\Repositories\CourseRepository;
use App\Repositories\PatternRepository;
use App\Repositories\MutexRepository;

class MutexController extends Controller {
    protected $courseRepo;
    protected $pattRepo;
    protected $mutexRepo;

    public function __construct(CourseRepository $courseRepo, PatternRepository $pattRepo, MutexRepository $mutexRepo) {
        $this->courseRepo = $courseRepo;
        $this->pattRepo = $pattRepo;
        $this->mutexRepo = $mutexRepo;
    }

    public function createCourseLock(Request $request, $courseId) {
        $course = $this->courseRepo->find($courseId);
        if($this->denies('owner-can-curd-design', $course) && $this->denies('owner-granted-access-design', [$course, ['edit']])) {
            abort(403);
        }
        $user = $this->getAuthUser();
        $errCode = null;
        $errMsg = null;
        try {
            $mutex = $this->mutexRepo->createCourseLock($user, $courseId);
        } catch(MutexException $e) {
            $errCode = $e->getCode();
            $errMsg = $e->getMessage();
        }

        if(is_null($errCode)) {
            return response()->json([
                'message' => 'Course locked.',
                'mutexId' => $mutex->id,
                'data' => [
                    'lastActiveOffset' => Carbon::now(env('APP_TIMEZONE'))->timestamp - $mutex->last_active->timestamp,
                ],
            ], 201);
        } else {
            return response()->json([
                'code' => $errCode,
                'message' => $errMsg,
            ], 423);
        }
    }

    public function createCollectionLock(Request $request, $collectId) {
        $collect = $this->pattRepo->findCollection($collectId);
        if($this->denies('owner-can-curd-collection', $collect) && $this->denies('owner-granted-access-collection', [$collect, ['edit']])) {
            abort(403);
        }
        $user = $this->getAuthUser();
        $errCode = null;
        $errMsg = null;
        try {
            $mutex = $this->mutexRepo->createCollectionLock($user, $collectId);
        } catch(MutexException $e) {
            $errCode = $e->getCode();
            $errMsg = $e->getMessage();
        }

        if(is_null($errCode)) {
            return response()->json([
                'message' => 'Collection locked.',
                'mutexId' => $mutex->id,
                'data' => [
                    'lastActiveOffset' => Carbon::now(env('APP_TIMEZONE'))->timestamp - $mutex->last_active->timestamp,
                ],
            ], 201);
        } else {
            return response()->json([
                'code' => $errCode,
                'message' => $errMsg,
            ], 423);
        }
    }

    public function takeoverCourseLock(Request $request, $courseId) {
        $course = $this->courseRepo->find($courseId);
        if($this->denies('owner-can-curd-design', $course) && $this->denies('owner-granted-access-design', [$course, ['edit']])) {
            abort(403);
        }
        $this->mutexRepo->releaseCourseLock($courseId);
        return $this->createCourseLock($request, $courseId);
    }

    public function takeoverCollectionLock(Request $request, $collectId) {
        $collect = $this->pattRepo->findCollection($collectId);
        if($this->denies('owner-can-curd-collection', $collect) && $this->denies('owner-granted-access-collection', [$collect, ['edit']])) {
            abort(403);
        }
        $this->mutexRepo->releaseCollectionLock($collectId);
        return $this->createCollectionLock($request, $collectId);
    }

    public function keepAlive(Request $request, $id) {
        $courseId = $request->input('courseId');
        $collectId = $request->input('collectId');
        $resetLastActive = (bool) $request->input('resetLastActive');
        $user = $this->getAuthUser();
        $errCode = null;
        $errMsg = null;
        try {
            if(empty($collectId)) {
                $mutex = $this->mutexRepo->keepCourseAlive($id, $courseId, $resetLastActive);
            } else {
                $mutex = $this->mutexRepo->keepCollectionAlive($id, $collectId, $resetLastActive);
            }
        } catch(MutexException $e) {
            $errCode = $e->getCode();
            $errMsg = $e->getMessage();
        }

        if(is_null($errCode)) {
            return response()->json([
                'message' => 'Mutex updated.',
                'mutexId' => $mutex->id,
                'data' => [
                    'lastActiveOffset' => Carbon::now(env('APP_TIMEZONE'))->timestamp - $mutex->last_active->timestamp,
                ],
            ], 200);
        } else {
            return response()->json([
                'code' => $errCode,
                'message' => $errMsg,
            ], 423);
        }
    }
}
