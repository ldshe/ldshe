<?php

namespace App\Repositories;

use Carbon\Carbon;
use Ramsey\Uuid\Uuid;

use App\Exceptions\MutexException;
use App\Models\ResourceMutex;
use App\Models\User;
use Config;
use DB;

class MutexRepository {

    private function createLock(\App\UserSpice\User $user, $resourceName, $resourceId) {
        $id = Uuid::uuid4();
        $userId = $user->data()->id;
        $now = Carbon::now(env('APP_TIMEZONE'));
        $keepAlive = clone $now;
        $keepAlive->addSeconds((int) Config::get('mutex.heartbeat_timeout'));

        $sql = <<<SQL
INSERT INTO ldshe_resource_mutexes(id, user_id, ${resourceName}_id, keep_alive, last_active, created_at, updated_at)
SELECT ?, ?, ?, ?, ?, ?, ? FROM dual
WHERE NOT EXISTS (
    SELECT 1 FROM ldshe_resource_mutexes WHERE ${resourceName}_id = ?
)
SQL;
        DB::beginTransaction();
        try {
            $inserted = DB::update($sql, [
                $id,
                $userId,
                $resourceId,
                $keepAlive->toDateTimeString(),
                $now->toDateTimeString(),
                $now->toDateTimeString(),
                $now->toDateTimeString(),
                $resourceId,
            ]);

            $mutex = ResourceMutex::where("${resourceName}_id", $resourceId)->first();
            if(!$inserted) {
                if($userId == $mutex->user_id) {
                    $now = Carbon::now(env('APP_TIMEZONE'));
                    $mutex->last_active = $now->toDateTimeString();
                    $mutex->keep_alive = $now->addSeconds(Config::get('mutex.heartbeat_timeout'))->toDateTimeString();
                    $mutex->save();
                    DB::commit();
                    return $mutex;
                } else {
                    $editor = User::find($mutex->user_id);
                    throw new MutexException('The resource is currently locked by '.$editor->fname.' '.$editor->lname.'.', 1);
                }
            }
            DB::commit();
            return $mutex;
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function createCourseLock(\App\UserSpice\User $user, $courseId) {
        return $this->createLock($user, 'course', $courseId);
    }

    public function createCollectionLock(\App\UserSpice\User $user, $collectId) {
        return $this->createLock($user, 'collection', $collectId);
    }

    private function releaseLock($resourceName, $resourceId) {
        ResourceMutex::where("${resourceName}_id", $resourceId)
            ->delete();
    }

    public function releaseCourseLock($courseId) {
        return $this->releaseLock('course', $courseId);
    }

    public function releaseCollectionLock($collectId) {
        return $this->releaseLock('collection', $collectId);
    }

    public function releaseExpiredLock() {
        $now = Carbon::now(env('APP_TIMEZONE'));
        $keepAliveTimeout = $now;
        $idleTimeout = clone $now;
        $idleTimeout->addSeconds(-1*Config::get('mutex.idle_timeout'));
        ResourceMutex::where('keep_alive', '<', $keepAliveTimeout->toDateTimeString())
            ->orWhere('last_active', '<', $idleTimeout->toDateTimeString())
            ->delete();
    }

    private function keepAlive($id, $resourceName, $resourceId, $resetLastActive=false) {
        $mutex = ResourceMutex::find($id);
        if($mutex) {
            DB::beginTransaction();
            try {
                $now = Carbon::now(env('APP_TIMEZONE'));
                if($resetLastActive) {
                    $mutex->last_active = $now->toDateTimeString();
                }
                $mutex->keep_alive = $now->addSeconds(Config::get('mutex.heartbeat_timeout'))->toDateTimeString();
                $mutex->save();
                DB::commit();
                return $mutex;
            } catch(Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } else {
            $mutex = ResourceMutex::where("${resourceName}_id", $resourceId)->first();
            if(empty($mutex)) {
                throw new MutexException("Lock is missing.", 2);
            } else {
                $editor = User::find($mutex->user_id);
                throw new MutexException($editor->fname.' '.$editor->lname.' has currently taken over the edit right.', 3);
            }
        }
    }

    public function keepCourseAlive($id, $courseId, $resetLastActive) {
        return $this->keepAlive($id, 'course', $courseId, $resetLastActive);
    }

    public function keepCollectionAlive($id, $collectId, $resetLastActive) {
        return $this->keepAlive($id, 'collection', $collectId, $resetLastActive);
    }

    public function updateLastActive($id, $resourceName, $resourceId) {
        $mutex = ResourceMutex::find($id);
        if($mutex) {
            DB::beginTransaction();
            try {
                $now = Carbon::now(env('APP_TIMEZONE'));
                $mutex->last_active = $now->toDateTimeString();
                $mutex->save();
                DB::commit();
            } catch(Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } else {
            $mutex = ResourceMutex::where("${resourceName}_id", $resourceId)->first();
            if(empty($mutex)) {
                throw new MutexException("Lock is missing.", 2);
            } else {
                $editor = User::find($mutex->user_id);
                throw new MutexException($editor->fname.' '.$editor->lname.' has currently taken over the edit right.', 3);
            }
        }
    }

    public function updateCourseLastActive($id, $courseId) {
        $this->updateLastActive($id, 'course', $courseId);
    }

    public function updateCollectionActive($id, $collectId) {
        $this->updateLastActive($id, 'collection', $collectId);
    }
}
