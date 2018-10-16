<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Events\CollectionContentUpdated;
use App\Repositories\PatternRepository;

class CollectionController extends Controller {

    protected $pattRepo;

    public function __construct(PatternRepository $pattRepo) {
        $this->pattRepo = $pattRepo;
    }

    public function getAllByOwner(Request $request) {
        $user = $this->getAuthUser();
        $collects = $this->pattRepo
            ->getCollectionsByOwner($user);
        return response()->json([
            'collections' => $collects,
        ], 200);
    }

    public function getRecentlyByOwner(Request $request) {
        $user = $this->getAuthUser();
        $collects = $this->pattRepo
            ->getRecentlyCollectionsByOwner($user);
        return response()->json([
            'collections' => $collects,
        ], 200);
    }

    public function getAllByCurator(Request $request) {
        if($this->denies('curator-can-list-curated-collection')) {
            abort(403);
        }
        $collects = $this->pattRepo
            ->getCollectionsByCurator();
        return response()->json([
            'collections' => $collects,
        ], 200);
    }

    public function getAllByContributed(Request $request) {
        if($this->denies('curator-can-review-collection')) {
            abort(403);
        }
        $status = $request->input('status');
        $collects = $this->pattRepo
            ->getCollectionsByContributed($status);
        return response()->json([
            'collections' => $collects,
        ], 200);
    }

    public function getAllByShared(Request $request) {
        $user = $this->getAuthUser();
        $mode = $request->input('mode');
        $collects = $this->pattRepo
            ->getCollectionsByShared($user, $mode);
        return response()->json([
            'collections' => $collects,
        ], 200);
    }

    public function getRecentlyByShared(Request $request) {
        $user = $this->getAuthUser();
        $collects = $this->pattRepo
            ->getRecentlyCollectionsByShared($user);
        return response()->json([
            'collections' => $collects,
        ], 200);
    }

    public function getAllBySharedGroup(Request $request, $groupId) {
        $user = $this->getAuthUser();
        $collects = $this->pattRepo
            ->getCollectionsBySharedGroup($user, $groupId);
        return response()->json([
            'collections' => $collects,
        ], 200);
    }

    private function fetch(Request $request, $collect) {
        $user = $this->getAuthUser();
        $collectId = $collect->id;
        $timestamp = $request->input('readOnly') ? null : $this->pattRepo->collectionRefreshAt($collectId);
        $isEditable = $this->allows('owner-can-curd-collection', $collect) ||
            $this->allows('owner-granted-access-collection', [$collect, ['edit']]);
        $pattern = $this->pattRepo->getCollection($collect);
        $data = [
            'pattern' => $pattern,
        ];
        $resp = [
            'collectId' => $collectId,
            'isEditable' => $isEditable,
            'data' => $data,
        ];
        if(isset($timestamp)) {
            $resp['timestamp'] = $timestamp;
        }
        return response()->json($resp);
    }

    public function getReadable(Request $request, $collectId) {
        $collect = $this->pattRepo->findCollection($collectId);
        if($this->denies('owner-can-curd-collection', $collect) &&
            $this->denies('owner-granted-access-collection', [$collect, ['read']]) &&
            $this->denies('curator-can-preview-collection', $collect)) {
            abort(403);
        }
        return $this->fetch($request, $collect);
    }

    public function getImportable(Request $request, $collectId) {
        $collect = $this->pattRepo->findCollection($collectId);
        if($this->denies('owner-can-curd-collection', $collect) && $this->denies('owner-granted-access-collection', [$collect, ['import']])) {
            abort(403);
        }
        return $this->fetch($request, $collect);
    }

    public function create(Request $request) {
        $user = $this->getAuthUser();
        $data = $request->input('data');
        $collectId = $this->pattRepo->createCollection($user, $data);
        $timestamp = $this->pattRepo->collectionRefreshAt($collectId);
        return response()->json([
            'message' => 'Collection created.',
            'collectId' => $collectId,
            'timestamp' => $timestamp,
        ], 201);
    }

    public function createCurated(Request $request) {
        $user = $this->getAuthUser();
        $collectId = $this->pattRepo->createCuratedCollection();
        $timestamp = $this->pattRepo->collectionRefreshAt($collectId);
        return response()->json([
            'message' => 'Curated collection created.',
            'collectId' => $collectId,
            'timestamp' => $timestamp,
        ], 201);
    }

    private function store($collect, $data) {
        $this->pattRepo->updateCollection($collect, $data);
        return response()->json([
            'message' => 'Collection updated.',
        ], 200);
    }

    public function update(Request $request, $collectId) {
        $collect = $this->pattRepo->findCollection($collectId);
        if($this->denies('owner-can-curd-collection', $collect) && $this->denies('owner-granted-access-collection', [$collect, ['edit']])) {
            abort(403);
        }
        $timestamp = $request->input('timestamp');
        if($this->denies('ensure-latest-collection', [$collect, $timestamp])) {
            abort(409);
        }
        $data = $request->input('data');
        event(new CollectionContentUpdated([
            'collectId' => $collectId,
            'data' => [
                'collection' => $data,
            ],
        ]));
        return $this->store($collect, $data);
    }

    public function updateSettings(Request $request, $collectId) {
        $collect = $this->pattRepo->findCollection($collectId);
        if($this->denies('owner-can-curd-collection', $collect) && $this->denies('owner-granted-access-collection', [$collect, ['edit']])) {
            abort(403);
        }
        $timestamp = $request->input('timestamp');
        if($this->denies('ensure-latest-collection', [$collect, $timestamp])) {
            abort(409);
        }
        $data = $request->input('data');
        event(new CollectionContentUpdated([
            'collectId' => $collectId,
            'data' => [
                'collectionSettings' => $data,
            ],
        ]));
        $this->pattRepo->updateInstanceSettings($data);
        return response()->json([
            'message' => 'Collection settings updated.',
        ], 200);
    }

    private function countDuplicateName($collect, &$data) {
        foreach($data as $rootId => &$value) {
            $value['fullname'] = preg_replace('/ - Copy \(\d+\)$/', '' , $value['fullname']);
            $nameCount = $this->pattRepo->countDuplicatedCollectionNames($collect, $value['fullname']) + 1;
            if($nameCount > 1) {
                $value['fullname'] = substr($value['fullname'], 0, 248).' - Copy ('.$nameCount.')';
            }
        }
    }

    public function copy(Request $request, $collectId) {
        $collect = $this->pattRepo->findCollection($collectId);
        if($this->denies('owner-can-curd-collection', $collect)) {
            abort(403);
        }
        $data = $request->input('data');
        $this->countDuplicateName($collect, $data);
        return $this->store($collect, $data);
    }

    public function import(Request $request, $collectId) {
        $collect = $this->pattRepo->findCollection($collectId);
        if($this->denies('owner-can-curd-collection', $collect)) {
            abort(403);
        }
        $data = $request->input('data');
        $this->countDuplicateName($collect, $data);
        $result = $this->store($collect, $data);
        $fromId = $request->input('fromId');
        $this->pattRepo->recordImportHistory($fromId, $collectId);
        return $result;
    }

    public function delete(Request $request, $collectId) {
        $collect = $this->pattRepo->findCollection($collectId);
        if($this->denies('owner-can-curd-collection', $collect)) {
            abort(403);
        }
        $this->pattRepo->deleteCollection($collect);
        return response()->json([
            'message' => 'Collection deleted.',
        ], 200);
    }

    public function getConfig(Request $request, $collectId) {
        $collect = $this->pattRepo->findCollection($collectId);
        if($this->denies('owner-can-curd-collection', $collect)) {
            abort(403);
        }
        $share = $this->pattRepo->getSharedCollection($collect);
        $contribution = $this->pattRepo->getContributedCollection($collect);
        return response()->json([
            'share' => $share,
            'contribution' => $contribution,
        ], 200);
    }

    public function configure(Request $request, $collectId) {
        $collect = $this->pattRepo->findCollection($collectId);
        if($this->denies('owner-can-curd-collection', $collect)) {
            abort(403);
        }
        $data = $request->input('data');
        foreach($data as $name => $value) {
            switch($name) {
                case 'share':
                $this->pattRepo->shareCollection($collect, $value);
                break;
            }
        }
        return response()->json([
            'message' => 'Settings applied.',
        ], 200);
    }

    public function makeContribution(Request $request, $collectId) {
        $collect = $this->pattRepo->findCollection($collectId);
        if($this->denies('owner-can-curd-collection', $collect)) {
            abort(403);
        }
        $this->pattRepo->contributeCollection($collect);
        return response()->json([
            'message' => 'Contribution request set.',
        ], 200);
    }

    public function reviewContribution(Request $request, $collectId) {
        $collect = $this->pattRepo->findCollection($collectId);
        if($this->denies('curator-can-review-collection', $collect)) {
            abort(403);
        }
        $status = $request->input('status');
        $this->pattRepo->reviewCollection($collect, $status);
        return response()->json([
            'message' => 'Contribution reviewed.',
        ], 200);
    }
}
