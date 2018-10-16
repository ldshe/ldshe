//Extend String
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.escapeRegExp = function() {
    return this.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

String.prototype.splitSnakeCase = function() {
  return this.replace(/_/g, ' ');
}

String.prototype.capitalizeAll = function() {
    let words = this.split(/\s+/g);
    words = words.map(w => w.capitalize());
    return words.join(' ');
}
