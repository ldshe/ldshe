<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Events\DesignContentUpdated;
use App\Repositories\CourseRepository;

class CourseController extends Controller {

    protected $repo;

    public function __construct(CourseRepository $repo) {
        $this->repo = $repo;
    }

    public function create(Request $request) {
        $user = $this->getAuthUser();
        $id = $this->repo->create($user);
        $timestamp = $this->repo->refreshAt($id);
        return response()->json([
            'message' => 'Course created.',
            'courseId' => $id,
            'timestamp' => $timestamp,
        ], 201);
    }

    public function createCurated(Request $request) {
        $user = $this->getAuthUser();
        $id = $this->repo->createCurated();
        $timestamp = $this->repo->refreshAt($id);
        return response()->json([
            'message' => 'Curated course created.',
            'courseId' => $id,
            'timestamp' => $timestamp,
        ], 201);
    }

    public function update(Request $request, $courseId) {
        $course = $this->repo->find($courseId);
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
                'course' => $data,
            ],
        ]));
        $this->repo->update($courseId, $data);
        return response()->json([
            'message' => 'Course updated.',
        ], 200);
    }

    public function delete(Request $request, $courseId) {
        $course = $this->repo->find($courseId);
        if($this->denies('owner-can-curd-design', $course)) {
            abort(403);
        }
        $this->repo->delete($courseId);
        return response()->json([
            'message' => 'Course deleted.',
        ], 200);
    }

    public function getConfig(Request $request, $courseId) {
        $course = $this->repo->find($courseId);
        if($this->denies('owner-can-curd-design', $course)) {
            abort(403);
        }
        $share = $this->repo->getShare($course);
        $contribution = $this->repo->getContribution($course);
        return response()->json([
            'share' => $share,
            'contribution' => $contribution,
        ], 200);
    }

    public function configure(Request $request, $courseId) {
        $course = $this->repo->find($courseId);
        if($this->denies('owner-can-curd-design', $course)) {
            abort(403);
        }
        $data = $request->input('data');
        foreach($data as $name => $value) {
            switch($name) {
                case 'share':
                $this->repo->share($course, $value);
                break;
            }
        }
        return response()->json([
            'message' => 'Settings applied.',
        ], 200);
    }

    public function makeContribution(Request $request, $courseId) {
        $course = $this->repo->find($courseId);
        if($this->denies('owner-can-curd-design', $course)) {
            abort(403);
        }
        $this->repo->contribute($course);
        return response()->json([
            'message' => 'Contribution request set.',
        ], 200);
    }

    public function reviewContribution(Request $request, $courseId) {
        $course = $this->repo->find($courseId);
        if($this->denies('curator-can-review-design', $course)) {
            abort(403);
        }
        $status = $request->input('status');
        $this->repo->review($course, $status);
        return response()->json([
            'message' => 'Contribution reviewed.',
        ], 200);
    }

}
