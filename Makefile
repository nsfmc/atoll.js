SRC_DIR = src
TEST_DIR = test
BUILD_DIR = build

PREFIX = .
DIST_DIR = ${PREFIX}/dist

JS_ENGINE ?= `which node nodejs`
COMPILER = ${JS_ENGINE} ${BUILD_DIR}/uglify.js --unsafe

ATOLL = ${DIST_DIR}/atoll.js
ATOLL_MIN = ${DIST_DIR}/atoll.min.js

ATOLL_VER = $(shell cat version.txt)
VERSION = sed "s/@ATOLL_VER/${ATOLL_VER}/"

DATE_GIT = $(shell git log -1 --pretty=format:%ad)

ifdef DATE_GIT
DATE = ${DATE_GIT}
else
DATE_HG = $(shell hg tip --template "{date|date}")
DATE = ${DATE_HG}
endif

core: atoll min
	@@echo "Atoll built!"

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

atoll : ${ATOLL}

${ATOLL}: ${DIST_DIR}
	@@echo "Building" ${ATOLL} ${ATOLL_VER}
	
	@@cat atoll.js | \
		sed 's/@TIP_DATE/'"${DATE}"'/' | \
		${VERSION} > ${ATOLL};

min: atoll ${ATOLL_MIN}


${ATOLL_MIN}: ${ATOLL}
	@@if test ! -z ${JS_ENGINE}; then \
		echo "Minifying Atoll" ${ATOLL_MIN}; \
		${COMPILER} ${ATOLL} > ${ATOLL_MIN}.tmp; \
		cp ${ATOLL_MIN}.tmp ${ATOLL_MIN}; \
		rm -f ${ATOLL_MIN}.tmp; \
	else \
		echo "You need NodeJS installed to minify Atoll"; \
	fi

clean:
	@@echo "Removing Distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}