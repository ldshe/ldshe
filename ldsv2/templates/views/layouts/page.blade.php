<!DOCTYPE html>
<html lang="en">
    <head>
    	<meta charset="utf-8">
    	<meta http-equiv="X-UA-Compatible" content="IE=edge">
    	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    	<meta name="description" content="">
    	<meta name="author" content="">
        {!!$head_tags!!}

        <title>{{$site_name}}</title>
        <link href="{{mix('css/app.css')}}" rel="stylesheet">

        @if(!empty($theme))
            <link href="{{mix("css/$theme")}}" rel="stylesheet">
        @endif

        @yield('style')
    </head>
    <body>
        <div class="userspice-theme">
            {!!$nav!!}
        </div>
        <div class="sticky-container">
            <div class="container-wrapper">
                <div class="container">
                    {!!$err!!}

                    {!!$msg!!}

                    @if(!$is_die)
                        @yield('content')
                    @endif
                </div>
            </div>
            <div class="sticky-footer">
                @include('partials.copyright')
            </div>
        </div>

        <script src="{{mix('js/manifest.js')}}"></script>
        <script src="{{mix('js/vendor.js')}}"></script>
        <script src="{{mix('js/app.js')}}"></script>
        @yield('script')
        @include('partials.google_analytics')
    </body>
</html>
