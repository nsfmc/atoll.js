# atoll.js

> Statistics are like bikinis.  What they reveal is suggestive, but what they conceal is vital.  
-- Aaron Levenstein

atoll.js is a small and simple statistical package written in javascript.

It implements many popular single-variable statistical methods that you would expect to find, for example, on a graphing calculator. It also has numerically stable implementations for variance/std dev in case you have very weird data.

## example

suppose you have some set of data in an array, you can operate on it in two ways:

    data = [1,2,3,4,5,6];
    
    // static methods
    stdDev = atoll.stdDev(data);
    
    // oop methods
    d = atoll(data);
    stdDev = d.stdDev();



## about

It currently supports:

* min/max
* mean (arithmetic, geometric, & harmonic), median
* sample central moments
* quartiles (q1,q2,q3, & the iqr)
* variance & standard deviation (both sample, population)
* skewness & kurtosis (both sample & population)
* histogram binning via root-n, sturges', scott's, and freedman-diaconis' choice.

The code is fairly self-documenting, so if you're actually a bit hazy on the nature of some stats function, you can refresh yourself on how it was derived by reading through the code, which almost always uses the standard notation that you'll see in the equation. It has fairly literate docco documentation in the comments which references how many of the functions are implemented both historically and technically.

It also includes a fairly comprehensive test-suite which attempts, as often as is possible, to compare a calculation with an exact numerical quantity.

### requirements

As it is currently coded, atoll.js assumes that `Array.prototype.map` and `Array.prototype.reduce` are present, which may pose a problem if you are targeting older browsers. If this is a significant problem, I may consider adding versions of them to the package.

## documentation

atoll is meant to be small, but expressive. Part of its design is to make some statistical functions slightly less opaque, while another part of its design is to allow it to be used seamlessly with graphics packages like d3.


### Utilities

Part of any stats toolkit is the basic set of single variable functions, `min`, `max`, `size`, `Sigma` and `Pi` are the core here.

    var pop = [7, 1, 2, 6, 5, 4, 3]
    var a = atoll(pop)
    
    a.min() // ==> 1
    a.max() // ==> 7
    a.size() // ==> 7

`Sigma` is a shorthand for calling `arr.map(f).reduce(sum)` on some array. Because you can plug in any `f`, it is reasonably versatile (and shows up quite often in the code, as summations are common in stats). If you don't pass any function to sigma, it assumes `f` is the identity function.

    a.Sigma() // ==> 28
    
    // or, called statically with a function that shifts
    // the list to => [3...9]
    atoll.Sigma(pop, function(x_i){return x_i + 2;}) // ==> 42

Similarly, `Pi` is used to take product of a given array and behaves similarly to Sigma, so you can, for example, take the *Geometric Mean* by doing the following:

    Math.pow( a.Pi(), (1 / a.size()) ); // ==> 3.3800151591412964


### Basic Stats

Most basic stats *except the mode* are calculated. Included in basic stats are the median, quartiles (q1,q3, iqr and lower/upper fences), mean (arithmetic, geometric, harmonic).

Using the quartile function, you should be able to roll your own boxplots with relatively little hassle.

    var pop = [1,2,4,6];
    var b = atoll(pop);
    
    b.median() // ==> 3
    b.mean() // ==> 3.25
    b.meanGeo() // ==> 2.6321480259049848
    b.meanHar() // ==> 2.0869565217391304
    
    b.quartiles() 
    // {"q1":1.5,"q2":3,"q3":5,"iqr":3.5,
    // "lowerFence":-3.75,"upperFence":10.25}


### Variance & Standard Deviation

Variance and standard deviation are two useful statistical measures that you'll probably calculate at some point. The default implementation of both variance and standard deviation use a simple two-pass algorithm that closely matches the equation you learn in school for calculating variance.

    var pop = [2,4,4,4,5,5,7,9];
    var c = atoll(pop);
    
    // the default stdDev function takes the unbiased sample
    // standard deviation. To take the population std dev, use
    // the stdDevPop function.
    c.stdDev() // ==> 2.138089935299395
    c.stdDevPop() // ==> 2
    
    // same goes for variance
    c.variance() // ==> 4.571428571428571
    c.variancePop() // ==> 4

If you have heavily mean-weighted data with some outliers, you may find that you need to use the *stable* implementation (predictably, based on a Knuth-derived algorithm) of variance/stdDev, for example

    var pop = [2.1, 2.2, 2, 2.05, 1.99, 2.01, 1.9, 3, 9]
    var d = atoll(pop)
    d.variance() // 5.312525000000001
    d.stableVariance() // 5.312525

which, although not a super compelling example, you may find that in some cases, the default implementation is slightly lacking and you may want to take a look at the stable implementation. *Caveat Emptor!*

In addition, there are also `stableVariancePop`, `stableStdDev` and `stableStdDevPop` which are *not* demoed here because it would be tedious.


### Skewness & Kurtosis

Kurtosis and Skewness are measures used to measure the pointiness and slantiness of a given sample, population or distribution. Kurtosis is useful for making inferences about the nature of a sample's variance. Skewness is useful for finding out how asymmetric a sample is or where its tail is (or how taily it is).

Both skewness and kurtosis are measured slightly inconsistently depending on who you ask, so to be clear: the `atoll.skewness()` and `atoll.kurtosis()` functions are both measuring *sample, unbiased skewness/kurtosis,* which is consistent with what you find in popular programs like Excel, OpenOffice or Minitab.

    var pop = [2.1, 2.2, 2, 2.05, 1.99, 2.01, 1.9, 3, 9]
    var e = atoll(pop)
    e.skewness() // ==> 2.890153276054925
    e.kurtosis() // ==> 8.468640018237197

If this is all you care about, *read no further!*

#### An Aside on Central Moments

Mathematica and other, more precisely worded applications, will give you 'kurtosis/skewness proper' which are also sometimes called Population Skewness/Kurtosis and can be found by using `kurtosisPop()` & `skewnessPop`. 

It turns out these are derived from the Central Moments of a given population/sample. As a result, there is a `centralMoment(arr, k)` function which will give you the *kth* central sample moment for some sample *arr*.

Let's see an example:

    var pop = [2.1, 2.2, 2, 2.05, 1.99, 2.01, 1.9, 3, 9];
    var mk = atoll(pop); // to mix + match in the example
    var m4 = atoll.centralMoment(pop,4); // 152.66381389111115
    var m2 = mk.centralMoment(2); // 4.722244444444446

Conveniently for this example, *Kurtosis Proper* is defined as *(m<sub>4</sub> / m<sub>2</sub><sup>2</sup>),* so if we continue down this path

    var B_2 = ( m4 / (m2 * m2) ); // 6.8460360095745285
    mk.kurtosisPop(); // 6.8460360095745285

You can check this against Mathematica if you'd like by [trying the problem in Wolfram Alpha](http://goo.gl/0CVLI). (n.b. `skewnessPop` is also calculated in a similar way, there are citations in the annotated source). To add to the confusion, when many people refer to Kurtosis, they refer to *Excess Kurtosis* which is defined as *&gamma;<sub>2</sub> = &beta;<sub>2</sub> - 3*. 

In actuality, it is these functions which are used as the baseline in atoll, the sample variants are multiplied by the same un-biasing coefficient which is used in all the common spreadsheet packages (again, see the annotated source for more information.)

### Histograms

The histogram api(if you can call it that) is still being written, but the idea is to do two things

* similar to `atoll.quartiles`, return bin width & number of bins for a given (or supplied) binning function. 
* provide an array of the histogram heights for the given binning function.

I think this is basic enough while still being useful and would make it trivial to graph a histogram using a package like d3 or protovis. Take a look at the source! It's not quite ready yet, but suggestions/pull requests are welcome, feel free to drop me a line `marcos at generic dot cx`.

## license

`atoll.js` is licensed under an MIT License.

    Copyright (C) 2011 by Marcos Ojeda, generic.cx

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.