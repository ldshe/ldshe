<?php

namespace App\Repositories;

use DB;
use Exception;
use App\Models\Course;
use App\Models\Session;
use Carbon\Carbon;

class SessionRepository {

    private function updateFields(Session $session, &$data) {
        foreach($data as $name => $value) {
            if($name != 'pre' && $name != 'in' && $name != 'post') {
                if($name == 'utcDate') {
                    $session->$name = empty($value) ? null : Carbon::parse($value);
                } else {
                    $session->$name = $value;
                }
            }
        }
    }

    private function updateAllocations(Session $session, &$data) {
        $session->pos = $data['pos'];
        $session->allocatedPatterns()->detach();

        collect($data['pre'])->each(function($pattId, $i) use ($session) {
            $session->allocatedPatterns()->attach($pattId, ['stage' => 'pre', 'pos' => $i]);
        });
        collect($data['in'])->each(function($pattId, $i) use ($session) {
            $session->allocatedPatterns()->attach($pattId, ['stage' => 'in', 'pos' => $i]);
        });
        collect($data['post'])->each(function($pattId, $i) use ($session) {
            $session->allocatedPatterns()->attach($pattId, ['stage' => 'post', 'pos' => $i]);
        });
    }

    public function get($courseId) {
        $course = Course::findOrFail($courseId);
        return $course->sessions()
            ->orderBy('pos')
            ->get()
            ->map(function($s) {
                $pres = $s->allocatedPatterns()
                    ->where('stage', 'pre')
                    ->orderBy('pos')
                    ->get()
                    ->map(function($p) {return $p->id;});
                $ins = $s->allocatedPatterns()
                    ->where('stage', 'in')
                    ->orderBy('pos')
                    ->get()
                    ->map(function($p) {return $p->id;});
                $posts = $s->allocatedPatterns()
                    ->where('stage', 'post')
                    ->orderBy('pos')
                    ->get()
                    ->map(function($p) {return $p->id;});

                $result = $s->toCamelArray();
                $result['pre'] = $pres;
                $result['in'] = $ins;
                $result['post'] = $posts;
                return $result;
            });
    }

    public function update($courseId, $data) {
        DB::beginTransaction();
        try {
            $course = Course::findOrFail($courseId);
            $sessionIds = [];
            foreach($data as $id => $value) {
                $sessionIds[] = $id;
            }

            $course->sessions
                ->filter(function($s) use ($sessionIds) {
                    return in_array($s->id , $sessionIds);
                })
                ->each(function($s) use (&$data) {
                    $d = $data[$s->id];
                    $this->updateFields($s, $d);
                    $this->updateAllocations($s, $d);
                    $s->save();
                    unset($data[$s->id]);
                });

            $sessions = collect($data)
                ->keys()
                ->map(function($k) use (&$data, $course) {
                    $d = $data[$k];
                    $s = new Session;
                    $s->id = $k;
                    $this->updateFields($s, $d);
                    $course->sessions()
                        ->save($s);
                    $this->updateAllocations($s, $d);
                    return $s;
                });

            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function delete($courseId, $data) {
        DB::beginTransaction();
        try {
            $course = Course::findOrFail($courseId);
            $course->sessions()
                ->whereIn('id', $data)
                ->delete();

            $course = $course->fresh();
            $sesses = $course->sessions()
                ->in()
                ->orderBy('pos')
                ->get();

            $i=0;
            foreach($sesses as $s) {
                $s->pos = $i++;
                $s->save();
            }
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
