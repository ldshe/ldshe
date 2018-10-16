<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Repositories\CourseRepository;
use App\Repositories\OutcomeRepository;
use App\Repositories\UnitRepository;
use App\Repositories\PatternRepository;
use App\Repositories\SessionRepository;

class DesignController extends Controller {

    protected $courseRepo;
    protected $outcomeRepo;
    protected $unitRepo;
    protected $pattRepo;
    protected $sessRepo;

    public function __construct(
        CourseRepository $courseRepo,
        OutcomeRepository $outcomeRepo,
        UnitRepository $unitRepo,
        PatternRepository $pattRepo,
        SessionRepository $sessRepo) {
            $this->courseRepo = $courseRepo;
            $this->outcomeRepo = $outcomeRepo;
            $this->unitRepo = $unitRepo;
            $this->pattRepo = $pattRepo;
            $this->sessRepo = $sessRepo;
    }

    public function getAllByOwner(Request $request) {
        $user = $this->getAuthUser();
        $courses = $this->courseRepo
            ->getByOwner($user);
        return response()->json([
            'designs' => $courses,
        ], 200);
    }

    public function getRecentlyByOwner(Request $request) {
        $user = $this->getAuthUser();
        $courses = $this->courseRepo
            ->getRecentlyByOwner($user);
        return response()->json([
            'designs' => $courses,
        ], 200);
    }

    public function getAllByCurator(Request $request) {
        if($this->denies('curator-can-list-curated-design')) {
            abort(403);
        }
        $courses = $this->courseRepo
            ->getByCurator();
        return response()->json([
            'designs' => $courses,
        ], 200);
    }

    public function getAllByShared(Request $request) {
        $user = $this->getAuthUser();
        $mode = $request->input('mode');
        $courses = $this->courseRepo
            ->getByShared($user, $mode);
        return response()->json([
            'designs' => $courses,
        ], 200);
    }

    public function getRecentlyByShared(Request $request) {
        $user = $this->getAuthUser();
        $courses = $this->courseRepo
            ->getRecentlyByShared($user);
        return response()->json([
            'designs' => $courses,
        ], 200);
    }

    public function getAllBySharedGroup(Request $request, $groupId) {
        $user = $this->getAuthUser();
        $courses = $this->courseRepo
            ->getBySharedGroup($user, $groupId);
        return response()->json([
            'designs' => $courses,
        ], 200);
    }

    public function getAllByContributed(Request $request) {
        if($this->denies('curator-can-review-design')) {
            abort(403);
        }
        $status = $request->input('status');
        $courses = $this->courseRepo->getByContributed($status);
        return response()->json([
            'designs' => $courses,
        ], 200);
    }

    private function fetch(Request $request, $course) {
        $user = $this->getAuthUser();
        $courseId = $course->id;
        $timestamp = $request->input('readOnly') ? null : $this->courseRepo->refreshAt($courseId);
        $isEditable = $this->allows('owner-can-curd-design', $course) ||
            $this->allows('owner-granted-access-design', [$course, ['edit']]);
        $course = $course->toCamelArray();
        $outcomes = $this->outcomeRepo->get($courseId);
        $units = $this->unitRepo->get($courseId);
        $patterns = $this->pattRepo->getPatterns($courseId);
        $instances = $this->pattRepo->getInstances($courseId);
        $sessions = $this->sessRepo->get($courseId);
        $data = [
            'course' => $course,
            'outcomes' => $outcomes,
            'units' => $units,
            'patterns' => $patterns,
            'instances' => $instances,
            'sessions' => $sessions,
        ];
        $resp = [
            'courseId' => $courseId,
            'isEditable' => $isEditable,
            'data' => $data,
        ];
        if(isset($timestamp)) {
            $resp['timestamp'] = $timestamp;
        }
        return response()->json($resp);
    }

    public function getReadable(Request $request, $courseId) {
        $course = $this->courseRepo->find($courseId);
        if($this->denies('owner-can-curd-design', $course) &&
            $this->denies('owner-granted-access-design', [$course, ['read']]) &&
            $this->denies('curator-can-preview-design', $course)) {
            abort(403);
        }
        return $this->fetch($request, $course);
    }

    public function getImportable(Request $request, $courseId) {
        $course = $this->courseRepo->find($courseId);
        if($this->denies('owner-can-curd-design', $course) && $this->denies('owner-granted-access-design', [$course, ['import']])) {
            abort(403);
        }
        return $this->fetch($request, $course);
    }

    public function read(Request $request, $courseId) {
        $request->merge(['readOnly' => true]);
        return $this->getReadable($request, $courseId);
    }

    private function store(Request $request, $courseId) {
        $c = $this->courseRepo->find($courseId);
        $user = $this->getAuthUser();
        if($this->denies('owner-can-curd-design', $c)) {
            abort(403);
        }
        $data = $request->input('data');
        $course = $data['course'];
        $outcomes = $data['outcomes'];
        $units = $data['units'];
        $patterns = $data['patterns'];
        $instances = $data['instances'];
        $sessions = $data['sessions'];
        $course['title'] = preg_replace('/ - Copy \(\d+\)$/', '' , $course['title']);
        $titleCount = $this->courseRepo->countDuplicatedTitles($c, $course['title']) + 1;
        if($titleCount > 1) {
            $course['title'] = substr($course['title'], 0, 248).' - Copy ('.$titleCount.')';
        }
        $this->courseRepo->update($courseId, $course);
        $this->outcomeRepo->update($courseId, $outcomes);
        $this->unitRepo->update($courseId, $units);
        $this->pattRepo->updatePatterns($courseId, $patterns);
        $this->pattRepo->updateInstances($courseId, $instances);
        $this->sessRepo->update($courseId, $sessions);
        return response()->json([
            'message' => 'Design updated.',
        ], 200);
    }

    public function copy(Request $request, $courseId) {
        return $this->store($request, $courseId);
    }

    public function import(Request $request, $courseId) {
        $result = $this->store($request, $courseId);
        $fromId = $request->input('fromId');
        $this->courseRepo->recordImportHistory($fromId, $courseId);
        return $result;
    }
}
