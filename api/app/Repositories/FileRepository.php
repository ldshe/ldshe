<?php

namespace App\Repositories;

use Config;
use DB;
use Exception;
use Log;
use Storage;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Ramsey\Uuid\Uuid;

use App\Models\File;
use App\UserSpice\User;

class FileRepository {

    private function saveLocal(File $f, UploadedFile $file) {
        $f->path = Storage::putFile(null, $file);
    }

    private function saveRemote(File $f, UploadedFile $file) {
        $fs = null;
        try {
            $fs = fopen($file->getRealPath(), 'r+');
            $f->path = Storage::put('/'.$f->name, $fs)['path'];
        } finally {
            if(isset($fs)) {
                fclose($fs);
            }
        }
    }

    public function create(User $user, $file, $isLocal) {
        DB::beginTransaction();
        try {
            $userId = $user->data()->id;
            $id = Uuid::uuid4();
            $f = new File;
            $f->id = $id;
            $f->owner_id = $userId;
            $f->name = $file->getClientOriginalName();
            $f->content_type = $file->getMimeType();
            $f->size = $file->getSize();
            if($isLocal) {
                $this->saveLocal($f, $file);
            } else {
                $this->saveRemote($f, $file);
            }
            $f->save();
            DB::commit();
            return $f;
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getLocal($id) {
        $f = File::findOrFail($id);
        $basePath = Storage::getDriver()->getAdapter()->getPathPrefix();
        $f->path = $basePath.'/'.$f->path;
        return $f;
    }

    public function getRemote($id) {
        $f = File::findOrFail($id);
        return Storage::url($f->path);
    }

    public function removeOrphan() {
        DB::beginTransaction();
        try {
            DB::table('files')
                ->whereNull('delete_at')
                ->whereNotExists(function($q) {
                    $q->select(DB::raw(1))
                        ->from('additional_attachments')
                        ->whereRaw('file_id = ldshe_files.id');
                })
                ->update(['delete_at' => Carbon::now(env('APP_TIMEZONE'))->addDay(Config::get('filesystems.orphan_file_last_in'))]);

            DB::table('files')
                ->whereNotNull('delete_at')
                ->where(function($q) {
                    $q->whereExists(function($q) {
                        $q->select(DB::raw(1))
                            ->from('additional_attachments')
                            ->whereRaw('file_id = ldshe_files.id');
                    });
                })
                ->update(['delete_at' => null]);
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }

        File::where('delete_at', '<=', Carbon::now(env('APP_TIMEZONE')))
            ->get()
            ->each(function($f) {
                try {
                    Storage::delete($f->path);
                    $f->delete();
                } catch(Exception $e) {
                    Log::error($e);
                }
            });
    }
}
