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
        # 정렬: 1.완주자 2.기록순(오름차순) 3.나머지
        return Racer.objects.order_by(
            Case(
                When(status='FINISH', then=0),
                When(status='START', then=1),
                default=2
            ),
            F('record').asc(nulls_last=True)
        )

    @action(detail=False, methods=['post'])
    def input_record(self, request):
        bib = request.data.get('bib')
        new_record = request.data.get('record')
        status = request.data.get('status', 'FINISH')
        
        # ★ 핵심: 프론트에서 보내준 '1' 또는 '2'를 받음 (없으면 무조건 '1'로 인식)
        run_type = str(request.data.get('run_type', '1'))

        if not bib:
            return Response({'error': '비브 번호가 필요합니다.'}, status=400)

        racer, created = Racer.objects.get_or_create(bib_number=bib)
        
        # 상태 업데이트 (출발, 완주, 실격 등)
        racer.status = status

        if status == 'FINISH':
            # 1. 1차전인지 2차전인지 구분해서 저장
            if run_type == '1':
                racer.run_1 = new_record
            elif run_type == '2':
                racer.run_2 = new_record
            
            # 2. Best Run 계산 (둘 중 빠른 기록 선택)
            records = []
            try:
                if racer.run_1: records.append(float(racer.run_1))
            except: pass # 숫자가 아니면 무시
            
            try:
                if racer.run_2: records.append(float(racer.run_2))
            except: pass

            if records:
                # 제일 작은 값(빠른 기록)을 최종 record로 저장
                best_time = min(records)
                racer.record = f"{best_time:.2f}"
            else:
                # 기록이 하나도 없으면(둘 다 취소 등) None
                racer.record = None
        
        racer.save()
        
        return Response({
            'status': 'ok', 
            'bib': racer.bib_number,
            'run_1': racer.run_1,
            'run_2': racer.run_2,
            'final_record': racer.record
        })

class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = NoticeSerializer

class StartListViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Racer.objects.all().order_by('bib_number')
    serializer_class = RacerSerializer