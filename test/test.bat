@echo off
echo This test is passed if the output matches the following:
echo Executing argument 0: echo foo
echo Executing argument 1: node test.js "echo bar" "node test.js ""echo baz"" ""echo quux""
echo foo
echo Executing argument 0: echo bar
echo Executing argument 1: node test.js "echo baz" "echo quux"
echo bar
echo Executing argument 0: echo baz
echo Executing argument 1: echo quux
echo baz
echo quux
echo --------------------------------------------------------
echo Starting test...
node test.js "echo foo" "node test.js ""echo bar"" ""node test.js """"echo baz"""" """"echo quux"""""""
echo --------------------------------------------------------
pause