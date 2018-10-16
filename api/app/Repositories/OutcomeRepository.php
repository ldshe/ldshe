<?php

namespace App\Repositories;

use DB;
use Exception;
use App\Models\Course;
use App\Models\Outcome;

class OutcomeRepository {

    public function get($courseId) {
        $course = Course::findOrFail($courseId);
        return $course->outcomes()
            ->orderBy('pos')
            ->get()
            ->map(function($o) {
                return $o->toCamelArray();
            });
    }

    private function updateFields(Outcome $outcome, &$data) {
        foreach($data as $name => $value) {
            $outcome->$name = $value;
        }
    }

    public function update($courseId, $data) {
        DB::beginTransaction();
        try {
            $course = Course::findOrFail($courseId);
            $outcomeIds = [];
            foreach($data as $id => $value) {
                $outcomeIds[] = $id;
            }

            $course->outcomes
                ->filter(function($o) use ($outcomeIds) {
                    return !in_array($o->id , $outcomeIds);
                })
                ->each(function($o) {
                    $o->delete();
                });

            $course = $course->fresh();
            $course->outcomes
                ->each(function($o) use (&$data) {
                    $d = $data[$o->id];
                    $this->updateFields($o, $d);
                    $o->save();
                    unset($data[$o->id]);
                });

            $outcomes = collect($data)
                ->keys()
                ->map(function($k) use (&$data) {
                    $d = $data[$k];
                    $o = new Outcome;
                    $o->id = $k;
                    $this->updateFields($o, $d);
                    return $o;
                });

            if(count($outcomes) > 0) {
                $course->outcomes()
                    ->saveMany($outcomes);
            }
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
