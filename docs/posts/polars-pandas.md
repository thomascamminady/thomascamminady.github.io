---
toc: false
style: ../assets/style.css

---
<script data-goatcounter="https://drtc.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>

# Polars vs. Pandas

## Preface

A couple of weeks ago I came across `polars` , a "[Lightning-fast DataFrame library for Rust and Python](https://www.pola.rs)." Since then, I have been playing around with it, trying to do some of my daily data analyses tasks with `polars` instead of `pandas` .

I wanted to summarize my experience using `polars` for some of the work that I am doing by comparing my `polars` implementation of a data analysis pipeline to the equivalent pipeline using `pandas` . The emphasis here is on the fact that it is *my* implementation. I am sure that both the `polars` and the `pandas` implementation can be improved or are not necessarily following best practices. Moreover, I am barely fluent in `polars` at this point.

Nevertheless, I think that I learned something for myself and have formed some opinion on things I like and dislike.

## Setup

I want to briefly discuss the data that I am encountering for this case study, as well as the steps in the analysis that I am performing.

The data I am using here is stored in a `parquet` file and the resulting data frame as approximately 40k rows with some 100 columns.

In a simplified way, that data looks like the following frame. There are two keys which contain measurements (thing of the first key of measurements with recording device A and B, and the second key of different days of the recordings.) Each measurement is a time series with columns `t` and `time` representing the local and global time, respectively. At those points in time, signals `y1` , `y2` , `y3` , ... are recorded.

|    | key1   | key2   |   t |       y1 |        y2 |       y3 | time                   |
|---:|:-------|:-------|----:|---------:|----------:|---------:|:-----------------------|
|  0 | A      | U      |   0 | 0.342872 | 0.731905  | 0.341766 | 02/02/2023 15:07:21.68 |
|  1 | A      | V      |   1 | 0.25941  | 0.493496  | 0.434559 | 02/02/2023 15:07:21.88 |
|  2 | A      | W      |   2 | 0.485956 | 0.550383  | 0.521913 | 02/02/2023 15:07:22.28 |
|  3 | A      | X      |   3 | 0.210544 | 0.406669  | 0.540021 | 02/02/2023 15:07:22.58 |
|  4 | B      | U      |   2 | 0.830654 | 0.0386757 | 0.635353 | 02/02/2023 15:07:22.88 |
|  5 | B      | V      |   3 | 0.187675 | 0.919848  | 0.648574 | 02/02/2023 15:07:23.28 |
|  6 | B      | W      |   4 | 0.506172 | 0.93743   | 0.554965 | 02/02/2023 15:07:23.58 |
|  7 | B      | X      |   5 | 0.21009  | 0.829689  | 0.857681 | 02/02/2023 15:07:23.88 |

The code below obfuscates the real column names because I don't want to give away sensitive information. However, It is worth outlining the steps that I am doing in the analysis. These steps include:
* The conversion of time stamps to `datetime` formats.
* Grouping data over keys and taking the mean value of the initial `N` samples of some columns.
* Subtracting those means from different columns.
* Computing rolling means of some columns and using those computed means to replace data in those rows where the mean is below a certain threshold.
* Compute a bunch of derived columns that use one or more of the existing columns in some transformation. Those are row wise operations that require no grouping or anything fancy.

## Using `polars`

Here's my implementation using `polars` for a total of 50 lines of code (LOC).
I scan the data instead of reading it directly to run the whole pipeline in a lazy way. Only the call to `collect` at the end actually forces a computation. Internally, the operations can be optimized and made more efficient.
I really like the chaining of operations. While it is somewhat verbose, it is consistent: Every new operation just gets chained to the existing operations with the `.keyword()` syntax.
Computing averages over groups with the `.median().over()` syntax feels nicer than the `pandas` equivalent of `.groupby().transform()` .

Creating new columns with the `.with_columns()` syntax has the downside, that you need to chain multiple calls to `.with_columns()` after another if you want to access a column that was created in a prior computation. This is also the reason why my `polars` implementation has roughly twice the number of LOC when compared with the `pandas` implementation.

One downside that I saw is that, different from `pandas` , I do not get any kind of auto-complete for the columns that are in a data frame when using the `pl.col("column name")` syntax. In pandas, VSCode will allow you to auto-complete the column name if you start typing `df["column` and `column_name` will pop up as a suggestion if it is an element of the data frame.

```python
lazy_frame = (
    pl.scan_parquet(path)
    .rename(mapping={"column1": "criteria2"})
    .with_columns(
        [
            pl.col("time").str.strptime(pl.Datetime, fmt="%m/%d/%Y %H:%M:%S%.f"),
            (pl.col("y1") * 16.7).alias("z1"),
        ]
    )
    .with_columns(
        [
            pl.col("y2").head(20).median().over("criteria1", "criteria2").alias("z3"),
            pl.col("z1").head(20).median().over("criteria1", "criteria2").alias("z4"),
            pl.col("t").min().over("criteria1", "criteria2").alias("z5"),
        ]
    )
    .with_columns((pl.col("z4") - pl.col("z3")).alias("z6"))
    .with_columns(
        [
            (pl.col("z1") - pl.col("z6")).alias("y8"),
            (pl.col("y2").rolling_min(8, center=True) < 10).alias("z10"),
            (pl.col("t") - pl.col("z5")).alias("t"),
            pl.when(pl.col("y2").rolling_min(8, center=True) < 10)
            .then(float("nan"))
            .otherwise(pl.col("y2"))
            .alias(("z2")),
        ]
    )
    .with_columns(
        [
            (2 * 3.14159 / 60 * pl.col("y2") * pl.col("y4")).alias("z8"),
            (2 * 3.14159 / 60 * pl.col("z2") * pl.col("y4")).alias(("z7")),
            (2 * 3.14159 / 60 * pl.col("y8") * pl.col("y4")).alias("y9"),
        ]
    )
    .with_columns((pl.col("y9") - pl.col("z7")).alias("Error"))
    .with_columns(
        (100 * pl.col("Error") / pl.col("z7")).alias("Percentage Error"),
    )
    .with_columns(((0.5 * pl.col("y10") + 0.5 * pl.col("y11"))).alias("z13"))
    .with_columns((313 * pl.col("y12") / (pl.col("z13") + 273)).alias("z12"))
    .select(["a list of some 10 columns that we want to preserve"])
)
frame = lazy_frame.collect()
```

## Using `pandas`

And here's the `pandas` implementation for a total of 26 LOC. The data frames are equal up to a small difference in the way `rolling` is treated between `polars` and `pandas` . Overall, this implementation is much more dense. This implementation is not making use of laziness.

```python
df = pd.read_parquet(path)
df["time"] = pd.to_datetime(df["time"], format="%m/%d/%Y %H:%M:%S.%f")
df.rename(columns={"column1": "criteria2"}, inplace=True)
df["z1"] = 16.7 * df["y1"]
df[["z3", "z4"]] = df.groupby(["criteria1", "criteria2"])[["y2", "z1"]].transform(
    lambda x: x.head(20).median()
)[["y2", "z1"]]
df["z5"] = df.groupby(["criteria1", "criteria2"])["t"].transform(lambda x: x.min())
df["z6"] = df["z4"] - df["z3"]
df["y8"] = df["z1"] - df["z6"]
df["z10"] = df["y2"].rolling(8, center=True).min() < 10
df["z2"] = df["y2"].copy()
df.loc[
    df["y2"].rolling(8, center=True).min() < 10,
    "z2",
] = float("nan")
df["t"] -= df["z5"]
df["z8"] = 2 * 3.14159 / 60 * df["y2"] * df["y4"]
df["z7"] = 2 * 3.14159 / 60 * df["z2"] * df["y4"]
df["y9"] = 2 * 3.14159 / 60 * df["y8"] * df["y4"]
df["Error"] = df["y9"] - df["z7"]
df["Percentage Error"] = 100 * df["Error"] / df["z7"]
df["z13"] = 0.5 * df["y10"] + 0.5 * df["y11"]
df["z12"] = 313 * df["y12"] / (df["z13"] + 273)
df = df[["a list of some 10 columns that we want to preserve"]]
```

## Timing results

Ultimately, a promise of `polars` is its speed. Running both examples 10 times gives the following timing results:

```
polars: 0.021s +- 0.001s
pandas: 0.181s +- 0.006s
ratios: 8.700  +- 0.375
```

That is, the `polars` implementation runs about 8 to 9 times faster on my 2022 MacBook Pro with an M1 Max chip and 32 GB of RAM. I am using `python 3.10` , `pandas 1.4.3` and `polars 0.16.9` .
Additionally, I created a larger `parquet` file by just concatenating the original data frame together for one hundred times, i.e.

```python
df = pd.read_parquet("./parquet/reduced_data.parquet")
largedf = pd.concat([df]*100)
largedf.to_parquet("./parquet/100reduced_data.parquet")
```

This is of course not representing an actual dataset that is 100 times larger, but it at least shows a trend of the performance for a potentially larger dataset. Here we're getting the following timings

```
polars: 1.028s +- 0.026s
pandas: 18.813s +- 0.403s
ratios: 18.315  +- 0.490
```

The ratio between both implementations has grown when going from 40k rows to 4.4M rows. (Interestingly, the files sizes of the `parquet` files are 11MB and 421MB, respectively. Not an increase by 100x.)

## Summary

I want to summarize two things, performance and writing code.

Performance wise, *my* `polars` implementation is a factor 8 to 9 faster for *my* example. It seems like this might be a lower bound when moving to larger files but I will keep an eye on that.
Given that I am only writing `polars` code since a month, I am happy with this performance gain.

From an implementation point of view, I was much faster using `pandas` . I have been using `pandas` for two years now and I guess that's just showing here. I really appreciate the auto complete feature for the column names which is a feature that I miss when using `polars` .

I do like the chaining of operations, but it makes the code longer and it is a bit annoying having to write code like this (using `pandas` ):

```
df["y"] = 123 + df["x"]
df["z"] = 456 + df["y"]
 ```

in this way (using `polars` ):

```
df.with_columns((pl.col("x") + 123).alias("y"))
    .with_columns((pl.col("y") + 456).alias("z"))
```

Especially with long column names and `black` formatting, this can double the number of LOC.

Overall I am quite happy with my `polars` experience and I will continue using it for project in the futures. One thing I hope for, is that `altair` can be used with `polars` data frames instead of needing to call `.to_pandas()` when passing the data to a chart.

Thanks for reading :)
