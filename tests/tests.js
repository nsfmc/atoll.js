// Tests for atoll.js

// a prior version of the library was called lies.js 
// (with great power comes great responsibility!)
var lies = atoll;

// many of the oop tests are *ridiculously* redundant, but
// are mostly to test if the oop wrapper breaks in some weird
// case that i haven't yet thought of.

module("Utilities");
test('Sigma', function(){
  var a = [1,2,3];
  var sq = function(x){return x * x;};
  var sumsq = lies.Sigma(a,sq);
  equals(sumsq, 14, "Sum of Squares OK");
  
  var isumsq = lies.Sigma(a);
  equals(isumsq, 6, "Identity Sum OK");
  
  var d = atoll(a);
  var sum = d.Sigma(function(x){return Math.pow(x,4);});
  equals(sum, 98, "OOP Sigma A-OK!");
});

test("Max/Min", function(){
  var a = [23, 3, -2, 153, 4];
  equals(lies.min(a), -2, "Min OK");
  equals(lies.max(a), 153, "Max OK");
  var ob = atoll(a);
  equals(ob.min(a), -2, "OOP Min OK");
  equals(ob.max(a), 153, "OOP Max OK");
  
});

test("Mean", function(){
  var a = [1,2,3,4];
  var x = lies.mean(a);
  var e = 2.5;
  equals(x, e, "Arithmetic Mean OK");
    
  var l = atoll(a);
  equals(l.mean(), 2.5, " OOP Arithmetic Mean OK!");
  
  var ob = atoll(a);
  var geom_exact = Math.pow(24 , 1/4);
  equals(atoll.meanGeo(a), geom_exact, "Geometric Mean OK!");
  equals(ob.meanGeo(), geom_exact, "OOP Geometric Mean OK!");
  equals(atoll.meanHar(a), geom_exact, "Harmonic Mean OK!");
  equals(ob.meanHar(), 48/25, "OOP Harmonic Mean OK!");
});

test("Central Moment for varying i",function(){
  var pop = [1,2,3,4,5,6];
  equals(lies.centralMoment(pop), 0, "central moment default (i=0) ok");
  equals(lies.centralMoment(pop, 0), 1, "0th central moment good!");
  equals(lies.centralMoment(pop, 1), 0, "1st central moment good!");
  
  // the second central moment === population variance
  equals(lies.centralMoment(pop, 2), 35/12, "2nd central moment good!");
  equals(lies.centralMoment(pop, 3), 0, "3nd central moment good!");
  equals(lies.centralMoment(pop, 4), 707/48, "4th central moment good!");
  
  // testing the oop interface
  var ob = atoll(pop);
  equals(ob.centralMoment(2), 35/12, "OOP 2nd central moment good!");
  equals(ob.centralMoment(3), 0, "OOP 3nd central moment good!");
  equals(ob.centralMoment(4), 707/48, "OOP 4th central moment good!");
  
  
});


module("Quartiles");
test('Quartile on Even-Length Sequence',function(){
  var pop = [7, 15, 36, 39, 40, 41];
  var a = lies.quartiles(pop);
  var x = {"q1":15, "q2":37.5, "q3":40, "iqr":25};
  equals(a.q1, x.q1, "q1 matches");
  equals(a.q2, x.q2, "q2 matches");
  equals(a.q3, x.q3, "q3 matches");
  equals(a.iqr, x.iqr, "iqr matches");
  
  var ob = atoll(pop);
  var qs = ob.quartiles();
  equals(qs.q1, x.q1, "OOP q1 matches");
  equals(qs.q2, x.q2, "OOP q2 matches");
  equals(qs.q3, x.q3, "OOP q3 matches");
  equals(qs.iqr, x.iqr, "OOP iqr matches");
    
});
test('Quartile on Odd-Length Sequence',function(){
  var pop = [6, 47, 49, 15, 42, 41, 7, 39, 43, 40, 36];
  var a = lies.quartiles(pop);
  var x = {"q1":15, "q2":40, "q3":43, "iqr":28};
  equals(a.q1, x.q1, "q1 matches");
  equals(a.q2, x.q2, "q2 matches");
  equals(a.q3, x.q3, "q3 matches");

  var ob = atoll(pop);
  var qs = ob.quartiles();
  equals(qs.q1, x.q1, "OOP q1 matches");
  equals(qs.q2, x.q2, "OOP q2 matches");
  equals(qs.q3, x.q3, "OOP q3 matches");
  equals(qs.iqr, x.iqr, "OOP iqr matches");
});


module("Variance & Standard Deviation");
test("Simple Two-Pass Variance", function(){
  var sv = lies.variance([1,2,3,4,5,6]);
  var ev = 3.5;
  equals(sv, ev, "Unbiased Sample Variance OK");
  
  var pv = lies.variancePop([1,2,3,4,5,6]);
  var epv = 17.5/6;
  equals(pv, epv, "Biased Population Variance OK");
  
  
  var ob = atoll([1,2,3,4,5,6]);
  equals(ob.variance(), ev, "OOP Unbiased Sample Variance OK");
  equals(ob.variancePop(), epv, "OOP Biased Population Variance OK");
});



test("Numerically Stable Variance", function(){
  var ssv = lies.stableVariance([1,2,3,4,5,6]);
  var essv = 3.5;
  equals(ssv, essv, "Unbiased Sample Variance OK");
  
  var svp = lies.stableVariancePop([1,2,3,4,5,6]);
  var esvp = 17.5/6;
  equals(svp, esvp, "Biased Population Variance OK");
  
  
  var ob = atoll([1,2,3,4,5,6]);
  equals(ob.stableVariance(), essv, "OOP Unbiased Sample Variance OK");
  equals(ob.stableVariancePop(), esvp, "OOP Biased Population Variance OK");
  
});



test("Standard Deviation", function(){
  var sp = lies.stdDevPop([2,4,4,4,5,5,7,9]);
  var esp = 2;
  equals(sp, esp, "Biased Population Standard Deviation OK");

  var s = lies.stdDev([2,4,4,4,5,5,7,9]);
  var es = 2.138089935299395;
  equals(s, es, "Unbiased Sample Stardard Deviation OK");
  
  
  var ob = atoll([2,4,4,4,5,5,7,9]);
  equals(ob.stdDevPop(), esp, "OOP Biased Population Standard Deviation OK");
  equals(ob.stdDev(), es, "OOP Unbiased Sample Stardard Deviation OK");
  
});

test("Numerically Stable Standard Deviation", function(){
  var sp = lies.stableStdDevPop([2,4,4,4,5,5,7,9]);
  var esp = 2;
  equals(sp, esp, "Biased Population Standard Deviation OK");

  var s = lies.stableStdDev([2,4,4,4,5,5,7,9]);
  var es = 2.138089935299395;
  equals(s, es, "Unbiased Sample Stardard Deviation OK");
  
  var ob = atoll([2,4,4,4,5,5,7,9]);
  equals(ob.stableStdDevPop(), esp, "OOP Biased Population Standard Deviation OK");
  equals(ob.stableStdDev(), es, "OOP Unbiased Sample Stardard Deviation OK");
  
});



module("Skewness & Kurtosis");
test("Skewness", function(){
  var pop = [21.3, 38.4, 12.7, 41.6];
  var p_skew = lies.skewnessPop(pop);
  var p_skew_exp = -0.1610744369682128;
  equals(p_skew, p_skew_exp, "Biased Population Skewness OK");
  
  var s_skew = lies.skewness(pop);
  var s_skew_exp = -0.2789891086294952;
  equals(s_skew, s_skew_exp, "Unbiased Sample Skewness OK");
  
  
  var ob = atoll(pop);
  equals(ob.skewnessPop(), p_skew_exp, "OOP Biased Population Skewness OK");
  equals(ob.skewness(), s_skew_exp, "OOP Unbiased Sample Skewness OK");
});



test("Kurtosis", function(){
  var pop = [1,2,3,4,5,61];
  var pop_kurt = lies.kurtosisPop(pop);
  var pop_kurt_exp = 37170327/8904200;
  equals(pop_kurt, pop_kurt_exp, "Population Kurtosis OK");

  var samp_kurt = lies.kurtosis(pop);
  var samp_kurt_exp = 5.925541177197279;
  equals(samp_kurt, samp_kurt_exp, "Sample Kurtosis OK");
  
  
  var ob = atoll(pop);
  equals(ob.kurtosisPop(), pop_kurt_exp, "OOP Biased Population Kurtosis OK");
  equals(ob.kurtosis(), samp_kurt_exp, "OOP Unbiased Sample Kurtosis OK");
  
});
