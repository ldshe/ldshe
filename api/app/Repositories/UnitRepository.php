<?php

namespace App\Repositories;

use DB;
use Exception;
use App\Models\Course;
use App\Models\Unit;

class UnitRepository {

    public function get($courseId) {
        $course = Course::findOrFail($courseId);
        return $course->units()
            ->orderBy('pos')
            ->get()
            ->map(function($u) {
                $outcomes = $u->outcomes
                    ->map(function ($o) {
                        return $o->id;
                    });
                $result = $u->toCamelArray();
                $result['outcomes'] = $outcomes;
                return $result;
            });
    }

    private function updateFields(Unit $unit, &$data) {
        foreach($data as $name => $value) {
            switch($name) {
                case 'outcomes':
                    $unit->outcomes()->detach();
                    $unit->outcomes()->attach($value);
                break;

                default:
                    $unit->$name = $value;
            }
        }
    }

    public function update($courseId, $data) {
        DB::beginTransaction();
        try {
            $course = Course::findOrFail($courseId);

            $unitIds = [];
            foreach($data as $id => $value) {
                $unitIds[] = $id;
            }

            $course->units
                ->filter(function($u) use ($unitIds) {
                    return !in_array($u->id , $unitIds);
                })
                ->each(function($u) {
                    $u->delete();
                });

            $course = $course->fresh();
            $course->units
                ->each(function($u) use (&$data) {
                    $d = $data[$u->id];
                    $this->updateFields($u, $d);
                    $u->save();
                    unset($data[$u->id]);
                });

            $units = collect($data)
                ->keys()
                ->map(function($k) {
                    $u = new Unit;
                    $u->id = $k;
                    return $u;
                });

            if(count($units) > 0) {
                $course->units()
                    ->saveMany($units);

                $units->each(function($u) use (&$data) {
                    $d = $data[$u->id];
                    $this->updateFields($u, $d);
                    $u->save();
                });
            }
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
