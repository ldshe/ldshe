<?php

namespace App\Http\Controllers;

use Config;
use Illuminate\Http\Request;

use App\Repositories\FileRepository;

class FileController extends Controller {

    protected $isLocal;
    protected $repo;

    public function __construct(FileRepository $repo) {
        $this->isLocal = Config::get('filesystems.default') == 'local';
        $this->repo = $repo;
    }

    public function create(Request $request) {
        $user = $this->getAuthUser();
        $file = $request->file('file');
        $file = $this->repo->create($user, $file, $this->isLocal);
        return response()->json([
            'message' => 'File uploaded.',
            'fileId' => $file->id,
            'data' => $file->toCamelArray(),
        ], 201);
    }

    public function get(Request $request, $id) {
        if($this->isLocal) {
            $file = $this->repo->getLocal($id);
            return response()->download($file->path, $file->name, [
                'Content-Type' => $file->content_type,
                'Content-Length' => $file->size,
            ]);
        }

        $remoteLink = (bool) $request->input('remoteLink');
        if($remoteLink) {
            return response()->json([
                'remoteLink' => $this->repo->getRemote($id),
            ], 200);
        }
        
        return redirect($this->repo->getRemote($id));
    }
}
