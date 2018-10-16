<?php

namespace App\Providers;

use Carbon\Carbon;
use DateInterval;
use Dusterio\LumenPassport\LumenPassport;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Laravel\Passport\Passport;
use Laravel\Passport\PassportServiceProvider as BasePassportServiceProvider;
use Laravel\Passport\Bridge\PersonalAccessGrant;
use Laravel\Passport\Bridge\RefreshTokenRepository;
use Laravel\Passport\Bridge\UserRepository;
use League\OAuth2\Server\AuthorizationServer;
use League\OAuth2\Server\Grant\ClientCredentialsGrant;
use League\OAuth2\Server\Grant\PasswordGrant;

use App\UserSpice\User;

class PassportServiceProvider extends BasePassportServiceProvider
{
    public function boot()
    {
        parent::boot();

        Auth::provider('userspice', function ($app, array $config) {
            return new UsUserServiceProvider;
        });

        App::bind(UserRepository::class, User::class);

        Passport::tokensExpireIn(Carbon::now(env('APP_TIMEZONE'))->addDays(Config::get('auth.tokensExpireIn')));

        Passport::refreshTokensExpireIn(Carbon::now(env('APP_TIMEZONE'))->addDays(Config::get('auth.refreshTokensExpireIn')));

        LumenPassport::routes($this->app, ['prefix' => 'v1/oauth']);
    }

    protected function registerAuthorizationServer()
    {
        $this->app->singleton(AuthorizationServer::class, function () {
            return tap($this->makeAuthorizationServer(), function ($server) {
                $server->enableGrantType(
                    $this->makeAuthCodeGrant(), Passport::tokensExpireIn()
                );

                $server->enableGrantType(
                    $this->makeRefreshTokenGrant(), Passport::tokensExpireIn()
                );

                $server->enableGrantType(
                    new PasswordGrant(
                        $this->app->make(User::class),
                        $this->app->make(RefreshTokenRepository::class)
                    ),
                    Passport::tokensExpireIn()
                );

                $server->enableGrantType(
                    new PersonalAccessGrant, new DateInterval('P1Y')
                );

                $server->enableGrantType(
                    new ClientCredentialsGrant, Passport::tokensExpireIn()
                );

                if (Passport::$implicitGrantEnabled) {
                    $server->enableGrantType(
                        $this->makeImplicitGrant(), Passport::tokensExpireIn()
                    );
                }
            });
        });
    }
}
