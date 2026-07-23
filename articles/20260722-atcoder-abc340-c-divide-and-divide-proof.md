---
title: "AtCoder ABC340 C - Divide and Divide：現れる数が floor/ceil(N/2^n) だけである証明"
emoji: "✂️"
type: "tech" # tech: 技術記事 / idea: アイデア
topics:
  - "競技プログラミング"
  - "atcoder"
  - "アルゴリズム"
  - "数学"
published: true
---

## この記事について

AtCoder ABC340 C - Divide and Divide のメモ化解法は、黒板に現れる整数が高々 $O(\log N)$ 種類しかないことに支えられている。本記事では、その根拠となる次の事実を証明する。すなわち、操作の途中で黒板に現れる整数は、ある $n \ge 0$ を用いて $\left\lfloor N/2^n \right\rfloor$ または $\left\lceil N/2^n \right\rceil$ と表せるものに限られる、というものである。

競プロの解説ではこの点は「明らかに $O(\log N)$ 種類」と流されがちだが、本記事は「なんとなく成り立ちそう」で済ませず、きちんと確かめたい読者に向けて証明を丁寧に与える。

## 問題の操作の設定

- 黒板に整数 $N$ がちょうど 1 個書かれている
- 黒板に $2$ 以上の整数がある限り、次の操作を繰り返す:
  - $2$ 以上の整数を 1 つ選び $x$ とし、黒板から消す
  - 代わりに $\left\lfloor x/2 \right\rfloor$ と $\left\lceil x/2 \right\rceil$ を新たに書く
- 本記事で示したいのは「支払い額」ではなく、**この操作の過程で黒板に現れうる整数の種類**についての主張である

## 記号と用語

- $\left\lfloor a \right\rfloor$: $a$ 以下の最大の整数（床関数）
- $\left\lceil a \right\rceil$: $a$ 以上の最小の整数（天井関数）
- 整数 $x$ に対し、操作 1 回で生まれる 2 つの整数 $\left\lfloor x/2 \right\rfloor$, $\left\lceil x/2 \right\rceil$ を $x$ の**子**と呼ぶ
- 「黒板に現れる整数」= 初期値 $N$ そのもの、および操作によって新しく書かれた整数すべて

## 示したいこと（主張）

黒板に現れるすべての整数は、ある整数 $n \ge 0$ を用いて次のいずれかの形で書ける。

$$
\left\lfloor \frac{N}{2^n} \right\rfloor \quad \text{または} \quad \left\lceil \frac{N}{2^n} \right\rceil
$$

証明には、操作の深さ $n$ に関する数学的帰納法を用いる。

## 証明

以下、初期値 $N$ から操作を $n$ 回たどって得られる値を「**深さ $n$ の値**」と呼び、次の集合を定める。

$$
S_n = \left\{ \left\lfloor \frac{N}{2^n} \right\rfloor,\ \left\lceil \frac{N}{2^n} \right\rceil \right\}
$$

「深さ $n$ の値はすべて $S_n$ に含まれる」を $n$ に関する数学的帰納法で示す。黒板に現れる値はいずれもある深さ $n$ をもつので、これが示せれば主張が従う。

### 初期段階

$n = 0$ のとき、深さ $0$ の値は初期値 $N$ ただ 1 つである。$N = \left\lfloor \frac{N}{2^0} \right\rfloor = \left\lceil \frac{N}{2^0} \right\rceil$ なので $N \in S_0$。よって主張は成り立つ。

### 帰納段階

深さ $n$ の値がすべて $S_n$ に含まれると仮定し、深さ $n+1$ の値がすべて $S_{n+1}$ に含まれることを示す。深さ $n+1$ の値は、ある深さ $n$ の値 $v \in S_n$ の子 $\left\lfloor v/2 \right\rfloor$ または $\left\lceil v/2 \right\rceil$ なので、これらが $S_{n+1}$ に入ることを言えばよい。

証明の要は、**どの子が $\left\lfloor N/2^{n+1} \right\rfloor$・$\left\lceil N/2^{n+1} \right\rceil$ のどちらに一致するかを特定しない**点にある。子は 4 通りあるが、そのうち「床側の値の天井の子」「天井側の値の床の子」がどちらに落ちるかは余りに依存して変わり、一意に決まらない。そこで個別の一致を追わず、**すべての子が 2 元集合 $S_{n+1}$ に収まる**ことだけを、次の 2 つの事実による挟み込みで示す。

**事実 1（入れ子の等式）**

$$
\left\lfloor \frac{1}{2} \left\lfloor \frac{N}{2^n} \right\rfloor \right\rfloor = \left\lfloor \frac{N}{2^{n+1}} \right\rfloor,
\qquad
\left\lceil \frac{1}{2} \left\lceil \frac{N}{2^n} \right\rceil \right\rceil = \left\lceil \frac{N}{2^{n+1}} \right\rceil
$$

これは床・天井の入れ子に関する等式 $\left\lfloor \lfloor m/a \rfloor / b \right\rfloor = \lfloor m/(ab) \rfloor$、$\left\lceil \lceil m/a \rceil / b \right\rceil = \lceil m/(ab) \rceil$（$m \ge 0$、$a, b$ は正整数）で $a = 2^n,\ b = 2$ とした場合である。床側は次のように確かめられる。$N = 2^n q_n + r_n\ (0 \le r_n \lt 2^n)$ と表すと $\left\lfloor N/2^n \right\rfloor = q_n$ である。さらに $q_n = 2 q_{n+1} + r\ (r \in \{0, 1\})$ と書けば $\left\lfloor q_n/2 \right\rfloor = q_{n+1}$ となる。一方これらを代入すると

$$
N = 2^{n+1} q_{n+1} + r_{n+1}, \qquad r_{n+1} = 2^n r + r_n
$$

であり、$r \in \{0, 1\}$ と $0 \le r_n \lt 2^n$ より $0 \le r_{n+1} \lt 2^{n+1}$ だから $\left\lfloor N/2^{n+1} \right\rfloor = q_{n+1}$。よって $\left\lfloor \frac{1}{2}\left\lfloor N/2^n \right\rfloor \right\rfloor = q_{n+1} = \left\lfloor N/2^{n+1} \right\rfloor$ を得る。天井側は、余り $r_n$ が正かどうかを追う一手間が加わるだけで同じ筋道で示せる（下記参照）。

:::details 事実 1 の天井側の証明

命題 $P$ が真のとき $1$、偽のとき $0$ を表す記号を $[\,P\,]$ と書く（アイバーソンの記法）。$N = 2^n q_n + r_n\ (0 \le r_n \lt 2^n)$ より

$$
\left\lceil \frac{N}{2^n} \right\rceil = q_n + [\, r_n > 0 \,]
$$

である（$r_n = 0$ なら割り切れて $q_n$、そうでなければ $q_n + 1$）。同様に、床側で導いた $r_{n+1} = 2^n r + r_n$ を用いると

$$
\left\lceil \frac{N}{2^{n+1}} \right\rceil = q_{n+1} + [\, r_{n+1} > 0 \,] = q_{n+1} + [\, r > 0 \ \text{または} \ r_n > 0 \,]
$$

が成り立つ（$r_{n+1} = 2^n r + r_n = 0$ となるのは $r = 0$ かつ $r_n = 0$ のときに限るため）。一方、$q_n = 2 q_{n+1} + r\ (r \in \{0, 1\})$ を代入すると

$$
\left\lceil \frac{1}{2} \left\lceil \frac{N}{2^n} \right\rceil \right\rceil
= \left\lceil \frac{2 q_{n+1} + r + [\, r_n > 0 \,]}{2} \right\rceil
= q_{n+1} + \left\lceil \frac{r + [\, r_n > 0 \,]}{2} \right\rceil
$$

となる。ここで $r + [\, r_n > 0 \,] \in \{0, 1, 2\}$ であり、$\lceil \cdot / 2 \rceil$ はこれを順に $0, 1, 1$ に写すので

$$
\left\lceil \frac{r + [\, r_n > 0 \,]}{2} \right\rceil = [\, r > 0 \ \text{または} \ r_n > 0 \,]
$$

である。したがって

$$
\left\lceil \frac{1}{2} \left\lceil \frac{N}{2^n} \right\rceil \right\rceil = q_{n+1} + [\, r > 0 \ \text{または} \ r_n > 0 \,] = \left\lceil \frac{N}{2^{n+1}} \right\rceil
$$

を得る。床側が余り $r_n$ の正負を気にせず済んだのに対し、天井側では $[\, r_n > 0 \,]$ の項を追う必要がある点だけが異なる。

:::

**事実 2（床と天井の差は高々 1）** 任意の有理数について床と天井の差は $0$ または $1$ なので

$$
\left\lceil \frac{N}{2^{n+1}} \right\rceil - \left\lfloor \frac{N}{2^{n+1}} \right\rfloor \le 1
$$

**挟み込み** $v \in S_n$ は $\left\lfloor N/2^n \right\rfloor \le v \le \left\lceil N/2^n \right\rceil$ を満たす。床・天井および $\lfloor \cdot/2 \rfloor,\ \lceil \cdot/2 \rceil$ は単調非減少なので、$v$ の任意の子 $c \in \left\{ \left\lfloor v/2 \right\rfloor,\ \left\lceil v/2 \right\rceil \right\}$ について

$$
\left\lfloor \frac{N}{2^{n+1}} \right\rfloor
\overset{\text{事実 1}}{=} \left\lfloor \frac{1}{2} \left\lfloor \frac{N}{2^n} \right\rfloor \right\rfloor
\le \left\lfloor \frac{v}{2} \right\rfloor
\le c
\le \left\lceil \frac{v}{2} \right\rceil
\le \left\lceil \frac{1}{2} \left\lceil \frac{N}{2^n} \right\rceil \right\rceil
\overset{\text{事実 1}}{=} \left\lceil \frac{N}{2^{n+1}} \right\rceil
$$

が成り立つ。したがって $c$ は区間 $\left[ \left\lfloor N/2^{n+1} \right\rfloor,\ \left\lceil N/2^{n+1} \right\rceil \right]$ に含まれる整数である。事実 2 よりこの区間に入る整数は両端の 2 つしかないので、$c$ は $\left\lfloor N/2^{n+1} \right\rfloor$ か $\left\lceil N/2^{n+1} \right\rceil$ のいずれかに一致する。すなわち $c \in S_{n+1}$。

以上より、深さ $n+1$ の値はすべて $S_{n+1}$ に含まれる。

### 結論

初期段階と帰納段階より、任意の $n \ge 0$ について深さ $n$ の値は $S_n$ に含まれる。黒板に現れる整数はいずれもある深さ $n$ をもつので、そのすべてが $S_n$ の要素、すなわち次のいずれかの形で書けることが数学的帰納法によって証明できた。

$$
\left\lfloor \frac{N}{2^n} \right\rfloor \quad \text{または} \quad \left\lceil \frac{N}{2^n} \right\rceil
$$


## 応用：メモ化が効く理由

- 現れる整数が $\left\lfloor N/2^n \right\rfloor$, $\left\lceil N/2^n \right\rceil$ の形に限られる
- $n$ の範囲は $0 \le n \le \log_2 N$ 程度なので、相異なる整数は高々 $O(\log N)$ 種類
- よって値をキーにしたメモ化（再帰）で支払い総額を計算でき、状態数が $O(\log N)$ ゆえ全体も $O(\log N)$ 時間で走る。$N \le 10^{17}$ でも十分間に合う

## まとめ

黒板に現れる整数が $\left\lfloor N/2^n \right\rfloor$ か $\left\lceil N/2^n \right\rceil$ に限られることを、操作の深さ $n$ に関する数学的帰納法で示した。種類数が $O(\log N)$ に収まるというメモ化解法の土台は、こうしてきちんと裏づけられる。

証明の肝は、床側・天井側の入れ子等式を上下端に固定し、単調性と「床と天井の差は高々 1」という 2 つの事実で 4 つの子を挟み込んだ点にある。個々の子が $\left\lfloor \cdot \right\rfloor$・$\left\lceil \cdot \right\rceil$ のどちらに落ちるかは余りに依存して定まらないが、そこを特定せずに「両端の 2 値に収まる」ことだけを言えば十分だった。この「厳密な対応づけを避ける」見立てこそが、場合分けの泥沼を回避する鍵になる。
