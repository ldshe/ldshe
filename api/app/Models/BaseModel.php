<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BaseModel extends Model {

    public function getAttribute($key) {
        if (array_key_exists($key, $this->relations)) {
            return parent::getAttribute($key);
        } else {
            return parent::getAttribute(snake_case($key));
        }
    }

    public function setAttribute($key, $value) {
        return parent::setAttribute(snake_case($key), $value);
    }

    public function toCamelArray() {
        $array = $this->toArray();
        foreach($array as $key => $value) {
            $return[camel_case($key)] = $value;
        }
        return $return;
    }

}
