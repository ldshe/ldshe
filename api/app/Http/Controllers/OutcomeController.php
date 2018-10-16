<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Events\DesignContentUpdated;
use App\Repositories\CourseRepository;
use App\Repositories\OutcomeRepository;

class OutcomeController extends Controller {

    protected $courseRepo;
    protected $outcomeRepo;

    public function __construct(
        CourseRepository $courseRepo,
        OutcomeRepository $outcomeRepo) {
            $this->courseRepo = $courseRepo;
            $this->outcomeRepo = $outcomeRepo;
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
                'outcomes' => $data,
            ],
        ]));
        $this->outcomeRepo->update($courseId, $data);
        return response()->json([
            'message' => 'Outcomes updated.',
        ], 200);
    }
}
