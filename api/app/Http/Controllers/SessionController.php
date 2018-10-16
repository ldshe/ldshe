<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Events\DesignContentUpdated;
use App\Repositories\CourseRepository;
use App\Repositories\SessionRepository;

class SessionController extends Controller {

    protected $courseRepo;
    protected $sessRepo;

    public function __construct(
        CourseRepository $courseRepo,
        SessionRepository $sessRepo) {
            $this->courseRepo = $courseRepo;
            $this->sessRepo = $sessRepo;
    }

    public function update(Request $request, $courseId) {
        $course = $this->courseRepo->find($courseId);
        if($this->denies('owner-can-curd-design', $course) && $this->denies('owner-granted-access-design', [$course, ['edit']])) {
            abort(403);
        }
        $timestamp = $request->input('timestamp');
        if($this->denies('ensure-latest-content', [$course, $timestamp])) {
            abort(409);
        }
        $data = $request->input('data');
        event(new DesignContentUpdated([
            'courseId' => $courseId,
            'data' => [
                'sessions' => $data,
            ],
        ]));
        $this->sessRepo->update($courseId, $data);
        return response()->json([
            'message' => 'Sessions updated.',
        ], 200);
    }

    public function delete(Request $request, $courseId) {
        $course = $this->courseRepo->find($courseId);
        if($this->denies('owner-can-curd-design', $course) && $this->denies('owner-granted-access-design', [$course, ['edit']])) {
            abort(403);
        }
        $timestamp = $request->input('timestamp');
        if($this->denies('ensure-latest-content', [$course, $timestamp])) {
            abort(409);
        }
        $data = $request->input('data');
        event(new DesignContentUpdated([
            'courseId' => $courseId,
            'data' => [
                'sessionsDeleted' => $data,
            ],
        ]));
        $this->sessRepo->delete($courseId, $data);
        return response()->json([
            'message' => 'Sessions deleted.',
        ], 200);
    }
}
