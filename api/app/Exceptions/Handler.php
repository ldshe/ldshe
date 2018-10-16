<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;
use Laravel\Lumen\Exceptions\Handler as ExceptionHandler;
use Symfony\Component\HttpKernel\Exception\HttpException;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that should not be reported.
     *
     * @var array
     */
    protected $dontReport = [
        AuthorizationException::class,
        HttpException::class,
        ModelNotFoundException::class,
        ValidationException::class,
    ];

    /**
     * Report or log an exception.
     *
     * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
     *
     * @param  \Exception  $e
     * @return void
     */
    public function report(Exception $e)
    {
        parent::report($e);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Exception  $e
     * @return \Illuminate\Http\Response
     */
    public function render($request, Exception $e)
    {
        // If the request wants JSON + exception is not ValidationException
        if ($request->wantsJson() && ( ! $e instanceof ValidationException && ! $e instanceof HttpResponseException)) {
           $status = Response::HTTP_BAD_REQUEST;
           $response = [];

           $response['message'] = $e->getMessage();
           if ($e instanceof AuthorizationException) {
               $status = Response::HTTP_FORBIDDEN;
           } else if ($e instanceof ModelNotFoundException) {
               $status = Response::HTTP_NOT_FOUND;
           } else if ($e instanceof HttpException) {
               $status = $e->getStatusCode();
           }

           // If the app is in debug mode
           if (env('APP_DEBUG')) {
               // Add the exception class name, message and stack trace to response
               $response['exception'] = get_class($e); // Reflection might be better here
               $response['trace'] = $e->getTrace();
           }

           // Return a JSON response with the response array and status code
           return response()->json($response, $status);
        }
        return parent::render($request, $e);
    }
}
