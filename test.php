<html>
<head>
    <meta charset="utf-8">
    <title>Testing</title>
    <link rel="stylesheet" type="text/css" href="http://192.168.0.13/simpled_admin/ui/forms/calendar.css">
    <script type="text/javascript" src="http://192.168.0.13/simpled_admin/ui/forms/sa_forms.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 100%;
        }
    </style>

    <script type="text/javascript">
        window.onload = function() {
            Calendar.createComponent(document.querySelector('#calendar'));
            Calendar.init();
        };
    </script>
</head>
<body>
    <div id="calendar"></div>


</body>
</html>