# race/models.py
from django.db import models

class Racer(models.Model):
    STATUS_CHOICES = [
        ('START', '대기'),
        ('FINISH', '완주'),
        ('DNS', '미출발'),
        ('DNF', '중도포기'),
        ('DSQ', '실격'),
    ]

    bib_number = models.IntegerField(unique=True)
    name = models.CharField(max_length=50, blank=True)
    category = models.CharField(max_length=50, blank=True, null=True)
    record = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='START')
    updated_at = models.DateTimeField(auto_now=True)
    run_1 = models.CharField(max_length=20, blank=True, null=True)
    run_2 = models.CharField(max_length=20, blank=True, null=True)
    
    def __str__(self):
        return f"{self.bib_number} - {self.name}"

class Notice(models.Model):
    content = models.CharField(max_length=200) # 공지 내용
    is_active = models.BooleanField(default=True) # 활성화 여부
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.content