// atoll.js @ATOLL_VER
//
// Copyright 2011 Marcos A. Ojeda, generic.cx
// Licensed under the MIT License
//
// "Statistics are like bikinis.  What they reveal is suggestive, 
//  but what they conceal is vital." -- Aaron Levenstein
//
// Date: @TIP_DATE


var atoll = function(){
  
  // ## utility functions
  
  
  
  // a local map function if it's not provided by Array.prototype
  var map = function(obj, callback, context) {
    var nativeMap = Array.prototype.map;
    var results = [];
    if (obj == null) { return results; };
    if (nativeMap && obj.map === nativeMap) { return obj.map(callback, context); };
    for(var i = 0; i < obj.length; i += 1){
      results[results.length] = callback.call(context, obj[i], i, obj);
    };
    return results;
  };
  
  
  
  // a local reduce function if it's not provided by the Array.prototype
  var reduce = function(obj, callback, initial) {
    var nativeReduce = Array.prototype.reduce;
    var init = (initial !== undefined); // init reveals if an initial val. passed
    if (obj == null) { obj = []; }; // feed null array to native funcs, let them deal
    if (nativeReduce && obj.reduce === nativeReduce) {
      return init ? obj.reduce(callback, initial) : obj.reduce(callback);
    };
    
    // `curr` is an accumulator for the final reduced value.
    var curr, len = obj.length, i;
    if(!init){
      for(i = 0 ; i === len;){
        // throw error if no initial value and empty array passed
        throw new TypeError("Reduce of empty array with no initial value");
      }
      // these two following lines seed `curr` so that the callback works
      // as expected if an initial value is passed in.
      curr = obj[i++]; // curr = obj[0] and now `i == 1`
    }else{
      curr = initial; // curr = initial and `i == 0`
    }
    for(i = i || 0; i < len; i += 1){
      curr = callback.call(undefined, curr, obj[i], obj);
    }
    return curr;
  };
  
  
  // a local filter function if it's not provided by Array.prototype
  var filter = function(obj, callback, context) {
    var nativeFilter = Array.prototype.filter;
    var results = [];
    if(obj == null) { return results; }
    if(nativeFilter && obj.filter === nativeFilter){
      return obj.filter(callback, context);
    }
    for(var i=0; i < obj.length; i += 1){
      var val = obj[i]; // save val in case the callback mutates it
      if( callback.call(context, obj[i], i, obj) ){ results.push(val); }
    }
    return results;
  };
  
  
  
  // min and max take the min and max of an array
  var min = function(arr){ return Math.min.apply(null, arr); };
  var max = function(arr){ return Math.max.apply(null, arr); };
  
  
  
  // return the sample size, mostly for making code self documenting
  var size = function(arr){ return arr.length; };
  
  
  
  // it's possible that neither map or reduce are available, as these 
  // are *'new'* as of 2005-2008, so, ummm... here's mapReduce
  var mapReduce = function(arr, mapFunc, reduceFunc){
    var mappedArray = map(arr, mapFunc);
    var reducedValue = reduce(mappedArray, reduceFunc);
    return reducedValue;
  };
  
  
  
  // `Sigma` is used to take sums on arrays without calling both map and reduce
  // each time, which can feel tedious (and could lead to error!)
  var Sigma = function(arr, mapFunc){
    var sum = function(prev, curr, idx, arr){return prev+curr;};
    // if no mapFunc is passed, the identity function is used
    if(!mapFunc){ mapFunc = function(x){return x;}; }
    
    return mapReduce(arr, mapFunc, sum);
  };
  
  var Pi = function(arr, mapFunc){
    var prod = function(prev, curr, idx, arr){return prev * curr;};
    
    // if no mapFunc is passed, the identity function is used
    if(!mapFunc){ mapFunc = function(x){return x;}; }
    
    return mapReduce(arr, mapFunc, prod);
  };
  
  
  
  // ## Basic Stats functions
  
  // Take the mean of a sample (the average, also known as the 
  // arithmetic mean)
  var mean = function(arr){
    return Sigma(arr) / arr.length;
  };
  
  
  
  // Take the geometric mean of a sample
  var meanGeo = function(arr){
    return Math.pow( Pi(arr), (1 / size(arr)) );
  };
  
  
  
  // Take the harmonic mean of a sample (uses the expanded version,
  // not the reciprocal of the arithmetic mean of reciprocals).
  var meanHar = function(arr){
    var n = size(arr);
    var pj = Pi(arr);
    return (n * pj) / Sigma(arr,function(x_i){return pj / x_i;});
  };
  
  
  
  // The median is either the middle element in a sorted list *or*
  // the mean of its two middle elements if the list has even length
  var median = function(arr){
    var elts = arr.length;
    var sorted = arr.sort(function(a,b){return a-b;});
    // Return the middle term in odd-length lists
    if(elts % 2 == 1){
      return sorted[((elts-1)/2)]; 
    }
    // Average the two middle terms for even-length lists
    else{ 
      var middle = sorted.slice((elts/ 2)-1, (elts/2)+1);
      return mean(middle);
    }
  };
  
  
  
  // the mode is a somewhat controversial function which gives you the
  // element or elements in your sample which are 'the most popular'.
  // Mathematica calls this 'commonest'. This function *always* returns
  // an array and will also work on non-numeric data.
  var mode = function(arr){
    var counter = function(collection,val){
      collection[val] = (collection[val] || {});
      // rather than incrementing collection[val], save the value
      // explicitly because getting keys back will stringify them
      collection[val]["value"] = collection[val]["value"] || val;
      collection[val]["count"] = (collection[val]["count"] || 0) + 1;
      return collection;
    };
    var freqs = reduce(arr, counter, {});

    // map over all the elements we collected and array-ify them as freqArr
    // with `[key, keyCount]`
    var freqArr = [];
    for (key in freqs){
      if (freqs.hasOwnProperty(key)){
        freqArr.push([freqs[key]["value"], freqs[key]["count"]]);
      }
    }
    
    var maximum = max( map(freqArr, function(x){ return x[1]; }) );
    var common = filter(freqArr, function(v){ return v[1] === maximum; });
    var commonest = map(common, function(v){ return v[0]; });
    // sort in increasing order (if numeric) otherwise you're on your own
    commonest = commonest.sort(function(a,b){return a-b;});
    return commonest;
  };
  
  
  
  // Quartiles are calculated similar to the median. The second quartile *is* 
  // the median, and `q1`/`q3` are the medians of the lower/upper halves, respectively.
  // 
  // There are other methods for picking quartiles which you may be interested
  // in, see [wikipedia](http://en.wikipedia.org/wiki/Quartile). This function
  // uses the TI-83 Method.
  var quartiles = function(arr){
    var sorted = arr.sort(function(a,b){return a-b;});
    var elts = size(arr);
    
    // Pick the two slice points, `c1`/`c2` for dividing the array
    var c1,c2; 
    if(elts % 2 == 0){ c1 = elts/2; c2 = elts/2; }
    else{ c1 = (elts - 1) / 2; c2 = c1+1; }
    
    var q1 = median(sorted.slice(0,c1));
    var q2 = median(sorted);
    var q3 = median(sorted.slice(c2));
    var iqr = q3-q1;
    
    // These are outlier cutoff points
    var lowerFence = q1 - (1.5 * iqr);
    var upperFence = q3 + (1.5 * iqr);
    var insiders = filter(arr, function(x){return x >= lowerFence && x <= upperFence;});
    var outsiders = filter(arr, function(x){return x < lowerFence || x > upperFence;});
    return { "q1":q1, "q2":q2, "q3":q3, "iqr":iqr, 
      "lowerFence":lowerFence, "upperFence":upperFence,
      "insiders":insiders, "outsiders":outsiders };
  };
  
  
  
  // Central Moments are useful for characterizing the nature of a sample. 
  // They are used to derive variance, skewness and kurtosis. You can learn
  // more at [wikipedia](http://en.wikipedia.org/wiki/Central_moment) and
  // [Mathworld](http://mathworld.wolfram.com/SampleCentralMoment.html).
  // 
  // This is technically a Sample Central Moment (or assumed to be)
  var centralMoment = function(arr, k){
    if (k === 0){return 1;}
    k = k || 1;
    var n = size(arr);
    var xbar = mean(arr);
    return Sigma(arr, function(x_k){ return Math.pow((x_k - xbar), k); }) / n;
  };
  
  
  
  // ##Variance & Standard Deviation
  //
  // There are two implementations for variance and standard deviation. 
  // The normally named functions (i.e. `variance`, `stdDev`, etc) use
  // the two-pass algorithm which may be inadequate for data which is
  // aggerssively mean-clustered. For more information about this, see 
  // [wikipedia](http://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Two-pass_algorithm)
  //
  
  // These two functions calculate variance in the same way that it is
  // defined mathematically (without expanding/simplifying the sum), so
  // they also use the same notation as much as is possible.
  var variancePop = function(arr){
    var mu = mean(arr);
    var N = size(arr);
    return Sigma(arr, function(x_i){ return Math.pow((x_i - mu), 2); }) / N;
  };
  
  
  
  // Calculates the variance for a sample using the traditional formula.
  // Both variance and standard deviation, use this formula.
  var variance = function(arr){
    var xbar = mean(arr);
    var n = size(arr);
    return Sigma(arr, function(x_i){ return Math.pow((x_i - xbar), 2); }) / (n - 1);
  };
  
  
  
  // Calculates the variance in a stable, online manner, from Knuth's 
  // implementation. Useful for calculating the variance for large 
  // samples where slight errors may introduce a progressively larger
  // error in calculating the variance. For more information, see
  // [wikipedia](http://en.wikipedia.org/wiki/Algorithms_for_calculating_variance)
  var stableVariancePop = function(arr){
    var xbar = 0, M2 = 0;
    for(var n=1; n <= size(arr); n += 1){
      var x = arr[n-1];
      var delta = x - xbar;
      xbar = xbar + delta / n;
      M2 = M2 + delta * (x - xbar);
    }
    return M2 / (n-1);
  };
  
  // The sample variance is calculated by multiplying the population 
  // variance by `n / (n - 1)`.
  var stableVariance = function(arr){
    var n = size(arr);
    return stableVariancePop(arr) * n / (n - 1);
  };
  
  
  
  // The standard deviation is defined as the square root of the variance
  var stdDevPop = function(arr){ return Math.sqrt(variancePop(arr)); };
  
  var stdDev = function(arr){ return Math.sqrt(variance(arr)); };
  
  var stableStdDev = function(arr){ return Math.sqrt(stableVariance(arr)); };
  
  var stableStdDevPop = function(arr){ return Math.sqrt(stableVariancePop(arr)); };
  
  
  
  // ## Skewness & Kurtosis
  
  // These two functions are inconsistently named across applications (and 
  // often defined ambiguously depending on where you look).
  //
  // Most applications such as Excel/Open Office provide you with the
  // 'sample skewness/kurtosis' whereas programs like Mathematica provide
  // the 'population skewness/kurtusis'. For more information & examples,
  // see [this](http://www.tc3.edu/instruct/sbrown/stat/shape.htm)
  //
  
  // Calculates skewness using central moments of the data provided.
  // This function represents biased *population* skewness, which is
  //  what Mathematica's skewness([]) function provides.
  var skewnessPop = function(arr){
    var m2 = centralMoment(arr, 2);
    var m3 = centralMoment(arr, 3);
    var g1 = m3 / Math.pow(m2,3/2);
    return g1;
  };
  
  // Calculates sample skewness. The unbiasing coefficient used is
  // taken from D.Joanes & C.Gill's 1998 paper in The Statistician,
  // *Comparing measures of sample skewness and kurtosis*.
  var skewness = function(arr){
    var n = size(arr);
    var c  = Math.sqrt(n * (n-1)) / (n - 2);
    var g1 = skewnessPop(arr);
    return (c * g1); 
  };
  
  
  // This is the biased Population Kurtosis. For a standard distribution,
  // the kurtosis will equal 3. The "kurtosis excess" is simply this minus 3.
  //
  // This function returns the 'kurtosis proper'
  var kurtosisPop = function(arr){
    var m4 = centralMoment(arr,4);
    var m2 = centralMoment(arr,2);
    return (m4 / (m2*m2));
  };
  
  // This is the unbiased Sample Kurtosis which is found in Excel/OO and
  // probably other basic stats packages.
  var kurtosis = function(arr){
    var n = size(arr);
    
    // g_2 is the "kurtosis 'excess'" and is shifted by three because
    // kurtosis on a standard distribution equals three. This makes it zero.
    // You can learn more at
    // [Mathworld](http://mathworld.wolfram.com/Kurtosis.html).
    var g_2 = kurtosisPop(arr) - 3;
    var c1 = (n - 1) / ((n - 2) * (n - 3));
    var gp = ((n + 1) * g_2) + 6;
    return c1 * gp;
  };
  
  
  // ## Histogram binning functions
  
  // These are not very well tested, but they will give you both bin sizes(`h`)
  // and a suggested number of bins(`k`) for a given sample. If you're curious 
  // about these functions, they're described briefly at [wikipedia][histref]
  // [histref]: http://en.wikipedia.org/wiki/Histogram#Number_of_bins_and_width
  //
  // They are not currently exported because they are going to be part of an
  // unobtrusive histogram toolkit. Please feel free to let me know if you have
  // any ideas or suggestions on that front. `marcos at generic dot cx`.
  
  
  // range here is not a flexible implementation, you have to pass all three
  // parameters in in order to get your correct array
  var range = function(start, stop, step){
    step = step || 1;
    for(var i=start,acc=[]; start + i*step <= stop; acc.push(i*step), i+=1){};
    return acc;
  };
  
  var sturgesFormula = function(arr){
    var n = size(arr);
    var k = Math.ceil((Math.log(n)/Math.log(2))+1);
    var h = (max(arr) - min(arr)) / k;
    return {"k":k, "h":h};
  };
  
  var scottsChoice = function(arr){
    var n = size(arr);
    var sigma = stdDev(arr);
    var h = (3.5 * sigma) / Math.pow(n, 1/3);
    var k = Math.ceil((max(arr) - min(x)) / h);
    return {"k": k, "h":h};
  };
  
  var squareRootChoice = function(arr){
    var n = size(arr);
    var k = Math.sqrt(n);
    var h = (max(x) - min(x)) / k;
    return {"k":k, "h":h};
  };
  
  
  // Freedman-Diaconis' Rule is used to select a bin size based on the IQR of
  // a given data set.
  var fdChoice = function(arr){
    var n = size(arr);
    var iqr = quartiles(arr)["iqr"];
    var h = (2 * iqr) / Math.pow(x, 1/3);
    var k = Math.ceil((max(arr) - min(x)) / h);
    return {"k":k, "h":h};
  };
  
  // Exported functions
  var exported = {
    "min" : min,
    "max" : max,
    "size" : size,
    "Sigma" : Sigma,
    "Pi" : Pi,
    
    "mean" : mean,
    "meanGeo" : meanGeo,
    "meanHar" : meanHar,
    "mode" : mode,
    "median" : median,
    "centralMoment" : centralMoment,
    
    "quartiles" : quartiles,
    "variance" : variance,
    "variancePop" : variancePop,
    "stableVariance" : stableVariance,
    "stableVariancePop" : stableVariancePop,
    
    "stdDev" : stdDev,
    "stdDevPop" : stdDevPop,
    "stableStdDev" : stableStdDev,
    "stableStdDevPop" : stableStdDevPop,
    
    "skewness" : skewness,
    "skewnessPop" : skewnessPop,
    "kurtosis" : kurtosis,
    "kurtosisPop" : kurtosisPop
  };
  
  // ### OOP Instance
  
  // This uses much the same structure that underscore.js uses to create
  // a double-duty static/object based function (if you can suggest a better
  // way, please do! i'm new to this).
  
  // atoll binds all the functions together and is returned
  var atoll = function(data){ return new coverup(data); };
  
  // the coverup is the oop instance of atoll
  var coverup = function(data) { this._data = data; };
  
  var addToCoverup = function(name, func, obj) {
    coverup.prototype[name] = function() {
      // turn args into array
      var args = Array.prototype.slice.call(arguments); 
      Array.prototype.unshift.call(args, this._data);
      return func.apply(atoll,args);
    };
  };
  
  
  // mixes in functions from bundle to parent
  atoll.mixin = function(bundle){
    var isFunction = function(obj) {
      return !!(obj && obj.constructor && obj.call && obj.apply);
    };
    for(var name in bundle){
      if(bundle.hasOwnProperty(name) && isFunction(bundle[name])){
        addToCoverup(name, atoll[name] = bundle[name]);
      }
    }
  };
  
  // mix in exported functions
  atoll.mixin(exported);
  
  // export for use in CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = atoll;
  }
  
  atoll.VERSION = '@ATOLL_VER';
  
  return atoll;

}();
