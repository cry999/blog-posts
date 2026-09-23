---
title: "手を動かしながら Neovim の Plugin を理解する ① - runtimepath と runtime files"
emoji: "🧩"
type: "tech"
topics:
  - "neovim"
  - "vim"
  - "lua"
  - "plugin"
  - "エディタ"
published: true
---

dotfiles の整理をきっかけに、Neovim の Plugin まわりの知識を整理していく。まずは基本機能である `'runtimepath'` について学ぶ。

実験環境には [anatolelucet/neovim](https://hub.docker.com/r/anatolelucet/neovim) の Docker イメージを利用する。

```sh
docker container run -it anatolelucet/neovim
```

## 1. 'runtimepath' とは?

[`:h 'runtimepath'`](https://neovim.io/doc/user/options.html#%27runtimepath%27) には次のように説明されている。

> List of directories to be searched for these runtime files: ...

`plugin/`, `lua/`, `ftplugin/` はもちろん、`colors/`, `compiler/`, `doc/`, `syntax/` など幅広い runtime files が対象に挙げられており、`runtimepath` は「neovim の機能が参照したい情報を探すためのディレクトリ一覧」だとわかる。

ここで意識しておきたいのは、**`runtimepath` はあくまで検索パスであり、そこに置いたファイルを neovim が自動で全部ロードしてくれる仕組みではない**という点である。いつ・どのようにロードされるかは各機能（subsystem）側の話であり、これは次章以降で実際に手を動かしながら確認していく。

値の確認は以下のコマンドでできる。

```vim
:set runtimepath?
```

runtimepath に設定されているディレクトリを順番に見ていくと、それぞれのディレクトリ配下に、次の runtime files で説明するディレクトリ構成を置けることがわかる。

## 2. 'runtimepath' で特別な意味を持つディレクトリ

ここでは、`runtimepath` 配下でよく使われる代表的なディレクトリを見ていく。具体的には以下の5つである。

- plugin/
- lua/
- ftplugin/
- pack/
- after/

### plugin/

`plugin/` に置かれたファイルは neovim 起動時に実行される。実際に以下のファイルを置いて実験してみる。

```sh
mkdir -p .config/plugin/
cat << EOF > .config/plugin/notify.lua
vim.notify('plugin/notify.lua loaded', vim.log.levels.INFO, { title = 'nvim' })
EOF
docker container run -v $(pwd)/.config/plugin:/root/.config/nvim/plugin -it anatolelucet/neovim
```

neovim を起動すると、通知が表示される。

![通知されている様子](/images/20260921-neovim-plugin-arch-1/plugin-exp.png)

### lua/

`lua/` に置かれたファイルは、`plugin/` とは異なり自動では読み込まれない。以下のファイルを置いて確認する。

```sh
mkdir -p .config/lua/
cat << EOF > .config/lua/notify.lua
vim.notify('lua/notify.lua loaded', vim.log.levels.INFO, { title = 'nvim' })
EOF
docker container run -v $(pwd)/.config/lua:/root/.config/nvim/lua -it anatolelucet/neovim
```

neovim 上で次のように実行すると、はじめて読み込まれる。

```vim
:lua require('notify')
```

init.lua や plugin などから呼び出されるモジュールを置くのが、一般的な利用方法のようだ。

### ftplugin/

`ftplugin/`（filetype plugin の略）に置かれたファイルは、指定した filetype のファイルを開いたときに自動的に呼ばれる。より正確には、バッファの `'filetype'` が設定されたときに発火する [`:h FileType`](https://neovim.io/doc/user/autocmd.html#FileType) イベントをきっかけに読み込まれるが、イベントの詳細は別の機会に扱うとして、ここではまず挙動を実験で確認する。

ここで重要なのが、`ftplugin/` 配下のファイル名は `'filetype'` の値と対応させる必要があるという点である。例えば `.txt` ファイルは、neovim 標準のファイルタイプ判定によって（ヘルプファイルの場合を除き）`filetype` が `text` になる。そのため対応する設定は `ftplugin/text.lua`（または `.vim`）という名前で置く必要がある。今開いているバッファの filetype は `:set filetype?` で確認できる。以下のファイルを置いて確認する。

```sh
mkdir -p .config/ftplugin/
cat << EOF > .config/ftplugin/text.lua
vim.notify('ftplugin/text.lua loaded', vim.log.levels.INFO, { title = 'nvim' })
EOF
docker container run -v $(pwd)/.config/ftplugin:/root/.config/nvim/ftplugin -it anatolelucet/neovim
```

まず `.txt` ではないファイルを開いてみる。

```vim
:e hoge.md
```

このときは通知されない。続けて `.txt` のファイルを開いてみると、

```vim
:e hoge.txt
```

今度は通知される。ここで、別の `.txt` ファイルを開いてみる。

```vim
:e foo.txt
```

こちらでも通知される。つまり `ftplugin/` は「filetype ごとに一度だけ」ではなく、**その filetype のバッファを新しく開くたびに** 実行されることがわかる。

:::details 補足: 同じバッファを開き直した場合
`hoge.txt` を開いた状態でもう一度 `:e hoge.txt` を実行しても、通知は出ない。

```vim
:e hoge.txt
```

これは `ftplugin/` 側の二重実行防止機構ではなく、neovim が「変更のない同一バッファ」に対する `:e` ではファイルを再読み込みせず、結果として `FileType` イベント自体が再発火しないためと考えられる。

なお、自作の ftplugin で明示的に二重実行を防ぎたい場合は、`b:did_ftplugin` というバッファローカル変数を使うのが定石になっている（[`:h write-filetype-plugin`](https://neovim.io/doc/user/usr_41.html#write-filetype-plugin)）。

```vim
" Only do this when not done yet for this buffer
if exists("b:did_ftplugin")
  finish
endif
let b:did_ftplugin = 1
```

> This also needs to be used to avoid that the same plugin is executed twice for
> the same buffer (happens when using an ":edit" command without arguments).

今回の実験スクリプトはこのガードを使っていないので、「同じバッファでは2回目が出ない」という上の挙動自体は `b:did_ftplugin` によるものではない点に注意。`b:did_ftplugin` はあくまで、ftplugin 作者が同じバッファに対して `FileType` が複数回発火するケースに備えて自衛する際の定石である。
:::

### pack/

`pack/` は neovim の builtin の package 機能である。公式ドキュメント（[`:h packages`](https://neovim.io/doc/user/pack.html#packages)）では次のように定義されている。

> A Vim "package" is a directory that contains |plugin|s.

つまり `pack/{name}/` の `{name}` は「複数の plugin をまとめるディレクトリ（package）」の名前であり、その直下の `start/{plugin}` や `opt/{plugin}` の `{plugin}` が個々の plugin のディレクトリ名にあたる。

`pack/*/start/*` は自動で runtimepath に追加される。各 `start/{plugin}` 配下には、`plugin/`, `autoload/`, `ftplugin/`, `syntax/`, `doc/` など、ここまで見てきた runtime files の構成をそのまま置く想定になっている（公式ドキュメントの例でも `pack/foo/start/foobar/plugin/foo.vim`, `pack/foo/start/foobar/syntax/some.vim` のように示されている）。一方 `pack/*/opt/*` に置かれたファイル群は `:packadd *` するまで読み込まれない、遅延ロード用の置き場である。start・opt いずれも、直下の `{plugin}` ディレクトリがそのまま runtimepath に追加されるため、その配下は runtime files の構成が要求される。

実際に確認してみる。

```sh
# start の用意
mkdir -p .config/pack/foo/start/bar/plugin/
cat << EOF > .config/pack/foo/start/bar/plugin/notify.lua
vim.notify('pack/foo/start/bar/notify.lua loaded', vim.log.levels.INFO, { title = 'nvim' })
EOF
# opt の用意
mkdir -p .config/pack/foo/opt/bra/plugin/
cat << EOF > .config/pack/foo/opt/bra/plugin/notify.lua
vim.notify('pack/foo/opt/bra/notify.lua loaded', vim.log.levels.INFO, { title = 'nvim' })
EOF

docker container run -v $(pwd)/.config/pack:/root/.config/nvim/pack -it anatolelucet/neovim
```

起動時は `pack/foo/start/bar/notify.lua loaded` のみが表示される。`:packadd bra` を実行すると、`pack/foo/opt/bra/notify.lua loaded` も表示される。

:::details 特別なフォルダ after/
`after/` も runtime files の一種のように見えるが、厳密には `runtimepath` 側の機能である。`runtimepath` に登録されているディレクトリの直下に `after/` を配置すると、neovim がそのディレクトリの後ろに `after/` を追加してくれる。`after/` も `runtimepath` の一員である以上、その配下には他のディレクトリと同じように runtime files を構成することで機能する。

`plugin/` と `after/plugin/` の両方に notify.lua を置いて、実行される順番を確認してみる。今回は `.config` 全体をマウントするので、前段までの実験の残骸を消してから始める。

```sh
rm -rf .config/*
mkdir -p .config/plugin
cat << EOF > .config/plugin/notify.lua
vim.notify('plugin/notify.lua loaded', vim.log.levels.INFO, { title = 'nvim' })
EOF
mkdir -p .config/after/plugin
cat << EOF > .config/after/plugin/notify.lua
vim.notify('after/plugin/notify.lua loaded', vim.log.levels.INFO, { title = 'nvim' })
EOF
docker container run -v $(pwd)/.config:/root/.config/nvim -it anatolelucet/neovim
```

画面には最後の通知しか残らないことがあるので、`:messages` で履歴を確認する。`plugin/notify.lua loaded` → `after/plugin/notify.lua loaded` の順で並んでいるはずである。つまり、通常の `plugin/` の読み込みが終わったあとに `after/plugin/` が読み込まれていることがわかる。
:::

## 3. init.lua

`init.lua` はユーザー設定を書くファイルとしてよく使われる。一見 `runtimepath` 直下に置くファイルの一つのように見えるが、実際は少し事情が異なる。

neovim の起動シーケンス（[`:h startup`](https://neovim.io/doc/user/starting.html#startup)）の中には、`stdpath('config')/init.lua` という決まった1箇所を直接読みに行くステップがある。これは `runtimepath` 上の各ディレクトリを走査して集めてくる、という他の runtime files の仕組みとは別物である。デフォルトでは `stdpath('config')` が `runtimepath` にも含まれているため紛らわしいが、「`runtimepath` に入っているから読まれる」わけではない。

読み込まれるタイミングは起動シーケンスの中でもかなり早い段階（ユーザー設定読み込みのステップ）であり、前述の `plugin/` の読み込みより前に実行される。実際に init.lua → plugin/ の順で読み込まれることを確認してみる。

```sh
rm -rf .config/*

# init.lua の追加
mkdir -p .config
cat << EOF > .config/init.lua
vim.g.init_loaded = true
vim.notify('init.lua loaded', vim.log.levels.INFO, { title = 'nvim' })
EOF

# plugin の追加
mkdir -p .config/plugin
cat << EOF > .config/plugin/order.lua
if vim.g.init_loaded then
  vim.notify('plugin/ loaded AFTER init.lua', vim.log.levels.INFO, { title = 'nvim' })
else
  vim.notify('plugin/ loaded BEFORE init.lua (想定外)', vim.log.levels.WARN, { title = 'nvim' })
end
EOF
docker container run -v $(pwd)/.config:/root/.config/nvim -it anatolelucet/neovim
```

`plugin/ loaded AFTER init.lua` が通知されれば、init.lua → plugin/ の順で読まれていることが確認できる。

---

最後に `.config` を片付けて終了する。

```sh
rm -r .config
```

## まとめ

neovim の設定・拡張は、起動時に直接読み込まれる `init.lua` と、`runtimepath` 上に置くことで各機能から検索される runtime files という、2つの異なる仕組みで成り立っている。runtimepath には `plugin/`, `lua/`, `ftplugin/`, `pack/`, `after/` のように役割の異なるディレクトリがいくつもあり、迷ったら [`:h rtp`](https://neovim.io/doc/user/options.html#%27runtimepath%27) で確認するとよい。次回は `runtimepath` を利用した簡単な plugin manager の自作と、可能であれば plugin manager のデファクトスタンダード（?）である lazy.nvim の仕組みとの比較・確認する予定である。

## 参考資料

- [`:h 'runtimepath'`](https://neovim.io/doc/user/options.html#%27runtimepath%27)
- [`:h startup`](https://neovim.io/doc/user/starting.html#startup)
- [`:h packages`](https://neovim.io/doc/user/pack.html#packages)
- [`:h FileType`](https://neovim.io/doc/user/autocmd.html#FileType)
- [`:h write-filetype-plugin`](https://neovim.io/doc/user/usr_41.html#write-filetype-plugin)
- [anatolelucet/neovim - Docker Hub](https://hub.docker.com/r/anatolelucet/neovim)
