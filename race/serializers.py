# race/serializers.py
from rest_framework import serializers
from .models import Racer, Notice

class RacerSerializer(serializers.ModelSerializer):
    rank = serializers.SerializerMethodField()

    class Meta:
        model = Racer
        fields = ['id', 'bib_number', 'name', 'category', 'record', 'status', 'run_1', 'run_2'] + ['rank']

    def get_rank(self, obj):
        if obj.status == 'FINISH' and obj.record:
            better = Racer.objects.filter(status='FINISH', record__lt=obj.record).count()
            return better + 1
        return '-'
    

class NoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = '__all__'