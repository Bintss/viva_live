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
        # 정렬: 1.완주자(FINISH) 2.기록순 3.나머지(DNS,DNF 등)
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
        new_record = request.data.get('record') # 숫자 기록
        status = request.data.get('status', 'FINISH') # 현재 상태 (FINISH, DNS, DQ 등)
        run_type = str(request.data.get('run_type', '1')) # 1차전 or 2차전

        if not bib:
            return Response({'error': '비브 번호가 필요합니다.'}, status=400)

        racer, created = Racer.objects.get_or_create(bib_number=bib)
        
        # 1. 해당 차수(run_1/run_2)에 값 저장
        # - 완주(FINISH)면 '기록(숫자)'을 저장
        # - 예외(DNS/DNF/DQ)면 '상태코드(문자)'를 그대로 저장
        value_to_save = new_record if status == 'FINISH' else status

        if run_type == '1':
            racer.run_1 = value_to_save
        elif run_type == '2':
            racer.run_2 = value_to_save
        
        # 2. Best Run 재계산 (유효한 숫자 기록 찾기)
        valid_times = []
        
        # 1차전 기록 검사
        try:
            if racer.run_1 and racer.run_1 not in ['DNS', 'DNF', 'DSQ', 'DQ']:
                valid_times.append(float(racer.run_1))
        except ValueError: pass

        # 2차전 기록 검사
        try:
            if racer.run_2 and racer.run_2 not in ['DNS', 'DNF', 'DSQ', 'DQ']:
                valid_times.append(float(racer.run_2))
        except ValueError: pass

        # 3. 최종 상태 및 기록 결정 (핵심 로직)
        if valid_times:
            # 유효한 기록이 하나라도 있으면 -> 무조건 'FINISH' (순위권 인정)
            racer.status = 'FINISH'
            best_time = min(valid_times)
            racer.record = f"{best_time:.2f}"
        else:
            # 유효한 기록이 하나도 없으면 -> 현재 입력한 예외 상태로 설정 (기록 없음)
            # (만약 1차 DNS 후 2차 DQ라면, 최근 상태인 DQ가 됨)
            racer.status = status
            racer.record = None
        
        racer.save()
        
        return Response({
            'status': 'ok', 
            'bib': racer.bib_number,
            'run_1': racer.run_1,
            'run_2': racer.run_2,
            'final_record': racer.record,
            'final_status': racer.status
        })

class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = NoticeSerializer

class StartListViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Racer.objects.all().order_by('bib_number')
    serializer_class = RacerSerializer