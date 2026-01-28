# race/views.py
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import F, Case, When
from .models import Racer, Notice
from .serializers import RacerSerializer, NoticeSerializer

class RacerViewSet(viewsets.ModelViewSet):
    queryset = Racer.objects.all()
    serializer_class = RacerSerializer

    def get_queryset(self):
        # 정렬 로직:
        # 1. 완주(FINISH)가 제일 위
        # 2. 기록(record) 작은 순 (오름차순)
        # 3. 나머지는 상태별로 뒤로 보냄
        return Racer.objects.order_by(
            Case(
                When(status='FINISH', then=0),
                When(status='START', then=1),
                default=2 # DNS, DNF, DSQ는 맨 뒤로
            ),
            F('record').asc(nulls_last=True)
        )

    @action(detail=False, methods=['post'])
    def input_record(self, request):
        bib = request.data.get('bib')
        new_record = request.data.get('record')
        status = request.data.get('status', 'FINISH') # ✅ 프론트에서 보낸 status 받기!
        run_type = request.data.get('run_type', '1')
        
        if not bib:
            return Response({'error': '비브 번호가 필요합니다.'}, status=400)

        # 비브가 있으면 가져오고, 없으면 새로 생성
        racer, _ = Racer.objects.get_or_create(bib_number=bib)
        
        racer.status = status # ✅ 받은 상태로 저장 (DNS, DNF, DSQ 등)
        if status == 'FINISH':
            if run_type == '1':
                racer.run_1 = new_record
            elif run_type == '2':
                racer.run_2 = new_record
            
            records = []
            if racer.run_1: records.append(float(racer.run_1))
            if racer.run_2: records.append(float(racer.run_2))

            if records:
                # 가장 작은 값(빠른 기록)을 최종 record로 설정
                best_time = min(records)
                racer.record = f"{best_time:.2f}" 
            else:
                racer.record = None
            
        else:
            # DNS, DNF, DSQ 등의 경우
            # (선택 사항: 실격이면 해당 차수 기록을 날릴지, 아니면 상태만 바꿀지 결정 필요.
            #  여기서는 일단 상태만 바꾸고 기록은 건드리지 않음)
            pass

        racer.save()
        
        return Response({'status': 'ok', 'final_record': racer.record})

class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = NoticeSerializer

class StartListViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Racer.objects.all().order_by('bib_number')
    serializer_class = RacerSerializer