import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:jobflow_mobile/main.dart';

void main() {
  testWidgets('JobFlow app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: JobFlowApp()));
    expect(find.text('JOBFLOW // MATRIX v3.0'), findsOneWidget);
  });
}
