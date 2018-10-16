@extends('layouts.page')

@section('script')
    <script src="{{mix('js/design.js')}}"></script>
@endsection

@section('content')
    <div id="design" data-user="{{$user_data}}"></div>
@endsection
