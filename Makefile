JS_SRC  = $(wildcard js/*.js)
JS_MIN  = $(JS_SRC:%.js=build/%.js)

HTML_SRC   = $(wildcard *.html)
HTML_OUT   = $(HTML_SRC:%.html=build/%.html)

all: build $(HTML_OUT) $(JS_MIN)

build:
	mkdir -p build/js

$(JS_MIN): build/%.js: %.js
	jsmin < $< > $@

$(HTML_OUT): build/%.html: %.html
	cp $< $@

deploy: build $(HTML_OUT) $(JS_MIN)
	git checkout gh-pages
	cp -r build/* .
	git add --all
	git commit -a -m "Auto-deployed page to github."
	git push origin gh-pages
	git checkout master

dev: build $(HTML_OUT) $(JS_MIN)
	cp -r js /srv/http/files/tracktime/.
	cp -r *.html /srv/http/files/tracktime/.

clean:
	rm -rf build
