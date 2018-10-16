<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Events\DesignContentUpdated;
use App\Repositories\CourseRepository;
use App\Repositories\PatternRepository;

class PatternController extends Controller {

    protected $courseRepo;
    protected $pattRepo;

    public function __construct(
        CourseRepository $courseRepo,
        PatternRepository $pattRepo) {
            $this->courseRepo = $courseRepo;
            $this->pattRepo = $pattRepo;
    }

    public function updatePatterns(Request $request, $courseId) {
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
                'patterns' => $data,
            ],
        ]));
        $this->pattRepo->updatePatterns($courseId, $data);
        return response()->json([
            'message' => 'Patterns updated.',
        ], 200);
    }

    public function deletePatterns(Request $request, $courseId) {
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
                'patternsDeleted' => $data,
            ],
        ]));
        $this->pattRepo->deletePatterns($courseId, $data);
        return response()->json([
            'message' => 'Patterns deleted.',
        ], 200);
    }

    public function updateInstances(Request $request, $courseId) {
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
                'instances' => $data,
            ],
        ]));
        $this->pattRepo->updateInstances($courseId, $data);
        return response()->json([
            'message' => 'Instances updated.',
        ], 200);
    }

    public function updateInstanceSettings(Request $request, $courseId) {
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
                'instanceSettings' => $data,
            ],
        ]));
        $this->pattRepo->updateInstanceSettings($data);
        return response()->json([
            'message' => 'Instances settings updated.',
        ], 200);
    }
}
